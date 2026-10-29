"""Rolling-origin metrics, interval diagnostics and out-of-sample driver ablations."""
import numpy as np
import pandas as pd
from data_pipeline import TARGETS, DRIVER_GROUPS
from forecasting import rolling_predictions, pretest_calibration_predictions, add_rolling_intervals, _hgb, _direct_training, backtest_origins
from data_pipeline import feature_frame

def score_predictions(predictions):
    rows=[]
    for (target,model,h),g in predictions.groupby(['target','model','horizon']):
        err=g.actual-g.prediction; nz=g.actual.abs()>1e-8
        rows.append({'target':target,'model':model,'horizon':int(h),'n_test':len(g),
                     'MAE':float(err.abs().mean()),'RMSE':float(np.sqrt((err**2).mean())),
                     'MAPE_nonzero_actual_pct':float((err[nz].abs()/g.loc[nz,'actual'].abs()).mean()*100) if nz.any() else np.nan})
    return pd.DataFrame(rows)

def interval_scores(intervals):
    rows=[]
    for (target,model,h),g in intervals.groupby(['target','model','horizon']):
        for level,lo,hi in [(80,'lower80','upper80'),(95,'lower95','upper95')]:
            z=g.dropna(subset=[lo,hi])
            if len(z):
                coverage=((z.actual>=z[lo])&(z.actual<=z[hi])).mean()
                width=(z[hi]-z[lo]).mean()
                qlo,qhi=(.10,.90) if level==80 else (.025,.975)
                errlo=z.actual-z[lo]; errhi=z.actual-z[hi]
                pinlo=np.maximum(qlo*errlo,(qlo-1)*errlo).mean()
                pinhi=np.maximum(qhi*errhi,(qhi-1)*errhi).mean()
                rows.append({'target':target,'model':model,'horizon':int(h),'interval':f'{level}%','n_test':len(z),
                             'empirical_coverage':float(coverage),'mean_width':float(width),
                             'pinball_loss_lower':float(pinlo),'pinball_loss_upper':float(pinhi),
                             'mean_edge_pinball_loss':float((pinlo+pinhi)/2)})
            else: rows.append({'target':target,'model':model,'horizon':int(h),'interval':f'{level}%','n_test':0,'empirical_coverage':np.nan,'mean_width':np.nan,'pinball_loss_lower':np.nan,'pinball_loss_upper':np.nan,'mean_edge_pinball_loss':np.nan})
    return pd.DataFrame(rows)

def driver_ablation(df, horizons=(1,3), n_releases=24):
    x_all={h:feature_frame(df,horizon=h) for h in horizons}; rows=[]
    raw_groups={
        'calendar':[c for c in df.columns if c.startswith('calendar_')],
        'rates':[c+'_lag1' for c in DRIVER_GROUPS['rates'] if c+'_lag1' in x_all[horizons[0]].columns],
        'liquidity':[c+'_lag1' for c in DRIVER_GROUPS['liquidity'] if c+'_lag1' in x_all[horizons[0]].columns],
        'equity':[c+'_lag1' for c in DRIVER_GROUPS['equity'] if c+'_lag1' in x_all[horizons[0]].columns]}
    allcols=list(x_all[horizons[0]].columns)
    driver_cols=set(sum(raw_groups.values(),[]))
    baseline=[c for c in allcols if c not in driver_cols]
    feature_sets={'autoregressive_only':baseline,**{k:baseline+v for k,v in raw_groups.items()}}
    n=len(df)
    for target in TARGETS:
        y=df[target].to_numpy(float)
        for h in horizons:
            x=x_all[h]
            for origin,target_idx in backtest_origins(n,h,n_releases):
                if origin<24: continue
                for group,cols in feature_sets.items():
                    # Driver ablation is explicitly scored out of sample against the same
                    # expanding-origin training labels and same lag-only estimator.
                    X,labels=_direct_training(x,y,origin,h,cols)
                    ok=X.notna().any(axis=1); X,labels=X.loc[ok],labels[ok.to_numpy()]
                    if len(labels)<24: pred=float(y[origin])
                    else:
                        model=_hgb(); model.fit(X,labels); pred=float(model.predict(x.iloc[[origin]][cols])[0])
                    rows.append({'target':target,'horizon':h,'origin_month':df.month.iloc[origin],
                                 'month':df.month.iloc[target_idx],'driver_set':group,
                                 'actual':float(y[target_idx]),'prediction':pred})
    raw=pd.DataFrame(rows)
    score=[]
    for (target,h,group),g in raw.groupby(['target','horizon','driver_set']):
        score.append({'target':target,'horizon':h,'driver_set':group,'n_test':len(g),'MAE':float((g.actual-g.prediction).abs().mean()),'RMSE':float(np.sqrt(((g.actual-g.prediction)**2).mean()))})
    metrics=pd.DataFrame(score)
    base=metrics[metrics.driver_set=='autoregressive_only'][['target','horizon','MAE']].rename(columns={'MAE':'baseline_MAE'})
    metrics=metrics.merge(base,on=['target','horizon'],how='left')
    metrics['MAE_reduction_vs_base_pct']=100*(metrics.baseline_MAE-metrics.MAE)/metrics.baseline_MAE
    return metrics,raw

def run_evaluation(df):
    raw=rolling_predictions(df,n_releases=24,horizons=(1,2,3,6))
    pretest=pretest_calibration_predictions(df,n_releases=24,horizons=(1,2,3,6))
    intervals=add_rolling_intervals(raw,pretest_predictions=pretest,min_calibration=8)
    metrics=score_predictions(raw); intervals_metrics=interval_scores(intervals)
    drivers,driver_folds=driver_ablation(df)
    return raw,pretest,intervals,metrics,intervals_metrics,drivers,driver_folds
