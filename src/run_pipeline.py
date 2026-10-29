"""Generate all FlowGuard analyses, forecasts, decision outputs and report."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
from data_pipeline import ROOT, DATA_PATH, load_dataset, quality_report, TARGETS
from evaluation import run_evaluation
from forecasting import forecast_next, forecast_scenario
from decision_engine import recommended_buffers, policy_backtest, summarize_policy, cost_sensitivity

OUT=ROOT/'outputs'; REPORTS=ROOT/'reports'

def md_table(frame):
    frame=frame.copy().fillna('—')
    cols=[str(c) for c in frame.columns]
    lines=['| '+' | '.join(cols)+' |','| '+' | '.join(['---']*len(cols))+' |']
    for row in frame.astype(str).itertuples(index=False,name=None):
        lines.append('| '+' | '.join(v.replace('|','\\|') for v in row)+' |')
    return '\n'.join(lines)

def main():
    OUT.mkdir(exist_ok=True); REPORTS.mkdir(exist_ok=True)
    df=load_dataset(); df.to_csv(ROOT/'data'/'processed'/'monthly_dataset.csv',index=False)
    quality_report(df).to_csv(OUT/'data_quality.csv',index=False)
    df[TARGETS].describe().T.to_csv(OUT/'flow_summary.csv')
    for target in TARGETS:
        fig,ax=plt.subplots(figsize=(10,3.8)); ax.plot(pd.to_datetime(df.month),df[target],marker='o',lw=1.3); ax.axhline(0,color='black',lw=.7)
        ax.set(title=target.replace('net_flow_','').title()+' fund monthly net flow',ylabel='Flow (source units)',xlabel='Month'); fig.tight_layout(); fig.savefig(OUT/f'{target}_timeseries.png',dpi=160); plt.close(fig)
    corr=df.select_dtypes('number').corr(); corr.to_csv(OUT/'correlations.csv')
    fig,ax=plt.subplots(figsize=(10,8)); im=ax.imshow(corr,vmin=-1,vmax=1,cmap='coolwarm'); ax.set_xticks(range(len(corr)),corr.columns,rotation=75,ha='right',fontsize=7); ax.set_yticks(range(len(corr)),corr.columns,fontsize=7); fig.colorbar(im,ax=ax); fig.tight_layout(); fig.savefig(OUT/'correlation_matrix.png',dpi=160); plt.close(fig)
    pred,pretest,intervals,metrics,interval_metrics,drivers,driver_folds=run_evaluation(df)
    pred.to_csv(OUT/'backtest_predictions.csv',index=False); pretest.to_csv(OUT/'calibration_predictions.csv',index=False); intervals.to_csv(OUT/'backtest_intervals.csv',index=False)
    metrics.to_csv(OUT/'model_metrics.csv',index=False); interval_metrics.to_csv(OUT/'interval_metrics.csv',index=False)
    drivers.to_csv(OUT/'driver_oos_comparison.csv',index=False); driver_folds.to_csv(OUT/'driver_oos_predictions.csv',index=False)
    forecasts=forecast_next(df,metrics,pred); forecasts.to_csv(OUT/'next_3_month_forecasts.csv',index=False)
    march=forecast_scenario(df,metrics,pred,horizon=6); march.to_csv(OUT/'march_15_scenario.csv',index=False)
    recommended_buffers(march).to_csv(OUT/'march_15_cash_buffer.csv',index=False)
    buffers=recommended_buffers(forecasts); buffers.to_csv(OUT/'cash_buffer_recommendation.csv',index=False)
    policies=policy_backtest(pred,metrics,df=df,pretest_predictions=pretest); policies.to_csv(OUT/'buffer_policy_backtest.csv',index=False)
    comparison=summarize_policy(policies); comparison.to_csv(OUT/'buffer_policy_comparison.csv',index=False)
    sensitivity=cost_sensitivity(pred,metrics,df=df,pretest_predictions=pretest); sensitivity.to_csv(OUT/'buffer_cost_sensitivity.csv',index=False)
    avail={'data_as_of_month':df.month.iloc[-1], 'forecast_created_local_date':pd.Timestamp.now().date().isoformat(),
           'release_status':'AMFI monthly reports verified; supplementary macro/market source panels lack retrieval-level audit metadata',
           'source_validation_report':'reports/data_validation.md',
           'target_sign':'positive means net inflow; negative means net outflow',
           'feature_timing':'Targets and monthly economic aggregates are lagged so only information through the prior month is used. Planned tax/quarter/fiscal calendar events are known ahead and aligned to the forecast target month.',
           'model_selection':'Model selected separately for each category and horizon by rolling-origin MAE across the last 24 target releases. The same folds are used for model selection and reported comparison; winner scores are validation estimates, not an independent final holdout.',
           'intervals':'Empirical residual intervals use prior rolling-origin forecast errors by category/model/horizon, including a pre-test calibration period. Backtest scoring still covers all 24 target releases; each interval uses only errors available before its origin. Small sample makes tail estimates uncertain.',
           'missingness':'The two initial NSE rolling-volatility observations remain missing in source data; lagged-feature imputation is fitted within each training fold.',
           'decision_cost':{'shortfall_multiplier':3.0,'idle_cash_yield_proxy':'latest available 91-day T-bill yield, annualized and prorated by horizon','sensitivity_shortfall_multipliers':[1,3,5],'note':'PS 03 specifies a 3x shortfall penalty. Idle cash yield drag is proxied with the 91-day T-bill yield because the data contain no direct cash-yield series.'}}
    (OUT/'forecast_metadata.json').write_text(json.dumps(avail,indent=2))
    lines=['# FlowGuard model results and methodology','',f"Dataset: {len(df)} monthly observations, {df.month.iloc[0]} to {df.month.iloc[-1]}. Targets use positive=inflow, negative=outflow.",'',
           '## Forecast engine','', 'Models are seasonal naive, additive ETS, and a regularized HistGradientBoosting regressor. Backtests use expanding origins over the same last 24 target months at horizons 1, 2, 3 and 6; the six-month horizon supports the separate March scenario. Forecast features are causal: prior-month flows/rates/liquidity/equity and scheduled target-month calendar events. Model selection is per target/horizon by lowest rolling-origin MAE.', '',
           '### Model comparison','',metrics.sort_values(['target','horizon','MAE']).pipe(md_table),'',
           'The lag-only tree is retained as an ML challenger; a small dataset and strong seasonal pattern can favor simple baselines. Rolling-origin results choose the final model rather than assuming ML wins. MAPE is supplementary and excludes near-zero actuals.', '',
           '## Prediction intervals','', '80% and 95% intervals are empirical residual intervals calibrated from earlier out-of-fold errors for each model, target and horizon. Coverage uses earlier pre-test and test-period out-of-fold calibration errors, with at least eight prior errors required. `outputs/interval_metrics.csv` reports empirical coverage, interval width and pinball loss for lower and upper interval edges.', '',
           '## Driver analysis','', 'Each driver group is added to the same autoregressive ML baseline and tested out of sample on rolling origins at 1- and 3-month horizons. Negative MAE reduction means that group worsened out-of-sample accuracy. This measures predictive value in this small sample, not causation.', '',drivers.pipe(md_table),'',
           '## Cash buffer and decision costs','', 'Recommended buffer is max(0, -lower05(net-flow forecast)), the 95th-percentile potential outflow. Central 80% and 95% two-sided intervals are reported separately. Backtest policy compares this forecast uncertainty buffer with the prior-year same-month net-outflow baseline. Decision cost is T-bill yield forgone on excess buffer + 3 × redemption shortfall, as specified in PS 03. Yield drag uses the latest 91-day T-bill yield available at the forecast origin and is prorated over the forecast horizon; sensitivity multipliers 1/3/5 are also reported.', '',comparison.pipe(md_table),'',
           '## Next three months','',forecasts.pipe(md_table),'',
           '## March 2027 monthly scenario','',march.pipe(md_table),'',
           '## Limitations','', 'Only 69 monthly observations are available. Model scores and interval tails are noisy; the rolling folds are also used for model selection, so report the comparison as validation rather than an unbiased final holdout. Economic relationships are evaluated with lagged features due lack of exact publication dates. The report does not claim causal drivers. Idle-cash yield drag is proxied with T-bill yield because no direct cash-yield series was supplied. The supplied monthly panel is not rebuilt from its raw source files; verify every source row before treating results as official AMFI history (see `reports/data_validation.md`).']
    (REPORTS/'model_comparison.md').write_text('\n'.join(lines)+'\n')
    print('Dataset',len(df),df.month.iloc[0],df.month.iloc[-1]); print(metrics.sort_values(['target','horizon','MAE']).groupby(['target','horizon']).head(1).to_string(index=False)); print('Outputs:',OUT)
if __name__=='__main__': main()
