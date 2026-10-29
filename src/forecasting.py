"""Leak-safe direct multi-horizon forecast engine and rolling-origin predictions."""
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.impute import SimpleImputer
from sklearn.pipeline import make_pipeline
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from data_pipeline import TARGETS, feature_frame, extend_future_calendar

MODEL_NAMES=['seasonal_naive','ETS','HistGradientBoosting']
MIN_TRAIN=24

def seasonal_naive(y, origin, horizon):
    idx=origin+horizon-12
    if idx >= 0: return float(y[idx])
    return float(y[origin])

def ets_forecast(y, origin, horizon):
    train=pd.Series(np.asarray(y[:origin+1],float))
    try:
        if len(train)>=24:
            model=ExponentialSmoothing(train,trend='add',seasonal='add',seasonal_periods=12,initialization_method='estimated').fit()
        else: model=ExponentialSmoothing(train,trend='add',initialization_method='estimated').fit()
        return float(model.forecast(horizon).iloc[-1])
    except Exception: return seasonal_naive(y,origin,horizon)

def _hgb(seed=42):
    return make_pipeline(SimpleImputer(strategy='median'), HistGradientBoostingRegressor(
        loss='squared_error', max_iter=80, learning_rate=.04, max_leaf_nodes=4,
        min_samples_leaf=6, l2_regularization=5.0, early_stopping=False, random_state=seed))

def _direct_training(x, y, origin, horizon, columns):
    # At origin t, labels may only extend through t. For a horizon h, only feature rows
    # k with k+h <= t can be used to train the direct h-step model.
    last=max(-1,origin-horizon)
    idx=np.arange(0,last+1)
    if not len(idx): return x.iloc[[]][columns], np.array([],float)
    X=x.iloc[idx][columns]; labels=np.asarray(y,dtype=float)[idx+horizon]
    ok=labels==labels
    return X.loc[ok],labels[ok]

def predict_one(df, x, target, origin, horizon, model, columns=None):
    y=df[target].to_numpy(float)
    if model=='seasonal_naive': return seasonal_naive(y,origin,horizon)
    if model=='ETS': return ets_forecast(y,origin,horizon)
    if model!='HistGradientBoosting': raise ValueError(f'Unknown model {model}')
    cols=list(columns) if columns is not None else list(x.columns)
    X,labels=_direct_training(x,y,origin,horizon,cols)
    valid=X.notna().sum(axis=1)>0
    X,labels=X.loc[valid],labels[valid.to_numpy()]
    if len(labels)<MIN_TRAIN: return seasonal_naive(y,origin,horizon)
    model_fit=_hgb(); model_fit.fit(X,labels)
    return float(model_fit.predict(x.iloc[[origin]][cols])[0])

def backtest_origins(n, horizon, n_releases=24):
    # Keep exactly the same last 24 target months for each horizon; origin is target-h.
    first=max(n-n_releases, MIN_TRAIN+horizon)
    return [(target-horizon,target) for target in range(first,n)]

def rolling_predictions(df, n_releases=24, horizons=(1,2,3,6)):
    records=[]
    for target in TARGETS:
        y=df[target].to_numpy(float)
        for h in horizons:
            x=feature_frame(df,horizon=h)
            for origin,target_idx in backtest_origins(len(df),h,n_releases):
                if origin<MIN_TRAIN: continue
                for model in MODEL_NAMES:
                    pred=predict_one(df,x,target,origin,h,model)
                    records.append({'target':target,'model':model,'horizon':h,'origin_month':df.month.iloc[origin],
                                    'month':df.month.iloc[target_idx],'actual':float(y[target_idx]),'prediction':pred})
    return pd.DataFrame(records)

def pretest_calibration_predictions(df, n_releases=24, horizons=(1,2,3,6)):
    """Generate earlier rolling-origin errors, strictly before the scored 24-release window."""
    cutoff=len(df)-n_releases; rows=[]
    x_by_h={h:feature_frame(df,horizon=h) for h in horizons}
    for target in TARGETS:
        y=df[target].to_numpy(float)
        for h in horizons:
            for target_idx in range(MIN_TRAIN+h,cutoff):
                origin=target_idx-h
                if origin<MIN_TRAIN: continue
                for model in MODEL_NAMES:
                    if model=='HistGradientBoosting':
                        X,labels=_direct_training(x_by_h[h],y,origin,h,list(x_by_h[h].columns))
                        valid=X.notna().sum(axis=1)>0
                        if int(valid.sum())<MIN_TRAIN: continue
                    pred=predict_one(df,x_by_h[h],target,origin,h,model)
                    rows.append({'target':target,'model':model,'horizon':h,'origin_month':df.month.iloc[origin],
                                 'month':df.month.iloc[target_idx],'actual':float(y[target_idx]),'prediction':pred})
    return pd.DataFrame(rows)

def add_rolling_intervals(predictions, pretest_predictions=None, min_calibration=8):
    out=[]
    for (target,model,h),g in predictions.groupby(['target','model','horizon'],sort=False):
        g=g.sort_values('month').reset_index(drop=True)
        hist=np.array([],float)
        if pretest_predictions is not None and not pretest_predictions.empty:
            c=pretest_predictions[(pretest_predictions.target==target)&(pretest_predictions.model==model)&(pretest_predictions.horizon==h)].sort_values('month')
            hist=(c.actual-c.prediction).to_numpy()
        for i,row in g.iterrows():
            current=(g.loc[:i-1,'actual']-g.loc[:i-1,'prediction']).to_numpy() if i else np.array([])
            residuals=np.concatenate([hist,current])
            record=row.to_dict(); record['calibration_n']=len(residuals)
            if len(residuals)>=min_calibration:
                q=np.quantile(residuals,[.025,.10,.90,.975])
                record.update(lower80=row.prediction+q[1],upper80=row.prediction+q[2],lower95=row.prediction+q[0],upper95=row.prediction+q[3])
            else: record.update(lower80=np.nan,upper80=np.nan,lower95=np.nan,upper95=np.nan)
            out.append(record)
    return pd.DataFrame(out)

def select_models(metrics):
    selected={}
    for (target,h),g in metrics.groupby(['target','horizon']):
        selected[(target,int(h))]=g.sort_values(['MAE','model']).iloc[0].model
    return selected

def forecast_next(df, metrics, predictions, horizon=3):
    future=extend_future_calendar(df,horizon); n=len(df); periods=pd.PeriodIndex(df.month,freq='M'); rows=[]
    selected=select_models(metrics)
    for target in TARGETS:
        y=df[target].to_numpy(float)
        for h in range(1,horizon+1):
            model=selected.get((target,h),'seasonal_naive')
            x=feature_frame(future,horizon=h)
            pred=predict_one(df,x,target,n-1,h,model)
            # Future intervals are calibrated from only out-of-fold errors of the selected
            # model at this target/horizon, all of which precede the forecast date.
            g=predictions[(predictions.target==target)&(predictions.model==model)&(predictions.horizon==h)].sort_values('month')
            residuals=(g.actual-g.prediction).to_numpy()
            q=np.quantile(residuals,[.025,.05,.10,.90,.975]) if len(residuals)>=8 else np.full(5,np.nan)
            rows.append({'forecast_month':str(periods[-1]+h),'target':target,'horizon':h,'selected_model':model,
                         'point_forecast':pred,'lower05':pred+q[1],'lower80':pred+q[2],'upper80':pred+q[3],
                         'lower95':pred+q[0],'upper95':pred+q[4],
                         'interval_method':'empirical out-of-fold residual quantiles, grouped by horizon',
                         'training_through':str(periods[-1])})
    return pd.DataFrame(rows)


def forecast_scenario(df, metrics, predictions, horizon=6):
    """Forecast a specific longer-horizon event month; keep separate from next-quarter rows."""
    future=extend_future_calendar(df,horizon); n=len(df); periods=pd.PeriodIndex(df.month,freq='M'); rows=[]
    selected=select_models(metrics)
    for target in TARGETS:
        model=selected.get((target,horizon),'seasonal_naive')
        x=feature_frame(future,horizon=horizon)
        pred=predict_one(df,x,target,n-1,horizon,model)
        g=predictions[(predictions.target==target)&(predictions.model==model)&(predictions.horizon==horizon)].sort_values('month')
        residuals=(g.actual-g.prediction).to_numpy()
        q=np.quantile(residuals,[.025,.05,.10,.90,.975]) if len(residuals)>=8 else np.full(5,np.nan)
        rows.append({'scenario':'Advance-tax date month (15 March)','forecast_month':str(periods[-1]+horizon),
                     'target':target,'horizon':horizon,'selected_model':model,'point_forecast':pred,
                     'lower05':pred+q[1],'lower80':pred+q[2],'upper80':pred+q[3],'lower95':pred+q[0],'upper95':pred+q[4],
                     'interval_method':'empirical out-of-fold residual quantiles at six-month horizon',
                     'training_through':str(periods[-1]),'frequency_note':'monthly flow estimate; not a daily 15 March forecast'})
    return pd.DataFrame(rows)
