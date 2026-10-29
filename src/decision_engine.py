"""95th-percentile potential-outflow buffer and rolling policy-cost comparison."""
import numpy as np
import pandas as pd
from forecasting import select_models
from data_pipeline import TARGETS

SHORTFALL_COST=3.0

def recommended_buffers(forecasts):
    rows=[]
    for _,r in forecasts.iterrows():
        # Lower 5% net-flow bound maps to upper-tail outflow, max(0, -q05(net flow)).
        rows.append({'forecast_month':r.forecast_month,'target':r.target,'horizon':int(r.horizon),
                     'selected_model':r.selected_model,'point_net_flow':r.point_forecast,
                     'p95_potential_outflow_buffer':max(0.0,-float(r.lower05)) if pd.notna(r.lower05) else np.nan,
                     'one_sided_lower05_net_flow':r.lower05,'confidence_interval_lower95':r.lower95,'confidence_interval_upper95':r.upper95,
                     'units':'source AMFI units','reason':'95th percentile potential outflow from lower 5% net-flow forecast bound'})
    return pd.DataFrame(rows)

def policy_backtest(predictions, metrics, df=None, pretest_predictions=None, shortfall_cost=SHORTFALL_COST, min_calibration=8):
    selected=select_models(metrics); rows=[]
    month_position={str(m):i for i,m in enumerate(df.month)} if df is not None else {}
    for target in TARGETS:
        for h in (1,2,3):
            model=selected.get((target,h),'seasonal_naive')
            g=predictions[(predictions.target==target)&(predictions.horizon==h)&(predictions.model==model)].sort_values('month').reset_index(drop=True)
            naive_rows=predictions[(predictions.target==target)&(predictions.horizon==h)&(predictions.model=='seasonal_naive')]
            naive_by_month=naive_rows.set_index('month').prediction.to_dict()
            historical=np.array([],float)
            if pretest_predictions is not None and not pretest_predictions.empty:
                c=pretest_predictions[(pretest_predictions.target==target)&(pretest_predictions.model==model)&(pretest_predictions.horizon==h)].sort_values('month')
                historical=(c.actual-c.prediction).to_numpy()
            for i,r in g.iterrows():
                prev=g.iloc[:i]
                residual=np.concatenate([historical,(prev.actual-prev.prediction).to_numpy()])
                if len(residual)<min_calibration: continue
                lower=float(r.prediction+np.quantile(residual,.05))
                proposed=max(0.0,-lower)
                # Official benchmark: keep last year's same-month outflow, regardless of winner.
                naive=max(0.0,-float(naive_by_month[r.month]))
                actual_outflow=max(0.0,-float(r.actual))
                origin_pos=month_position.get(str(r.origin_month),0)
                rate=np.nan
                if df is not None and origin_pos>0 and 'tbill_91d_yield' in df:
                    rate=float(df.loc[origin_pos-1,'tbill_91d_yield'])
                if not np.isfinite(rate): rate=0.0
                for policy,buffer in [('forecast_p95_buffer',proposed),('last_year_same_month_outflow',naive)]:
                    shortfall=max(0.0,actual_outflow-buffer); excess=max(0.0,buffer-actual_outflow)
                    # Idle cash is assumed to forgo the prior-known 91-day T-bill yield.
                    yield_drag=excess*max(rate,0.0)/100.0*h/12.0
                    cost=yield_drag+shortfall_cost*shortfall
                    rows.append({'target':target,'month':r.month,'origin_month':r.origin_month,'horizon':h,'selected_model':model,
                                 'policy':policy,'buffer':buffer,'realized_outflow':actual_outflow,'excess_cash':excess,
                                 'tbill_yield_used_pct':rate,'holding_period_months':h,'idle_cash_yield_drag':yield_drag,
                                 'shortfall':shortfall,'shortfall_penalty':shortfall_cost*shortfall,'decision_cost':cost,
                                 'shortfall_cost_multiplier':shortfall_cost,'calibration_n':len(residual)})
    return pd.DataFrame(rows)

def summarize_policy(rows):
    if rows.empty: return pd.DataFrame()
    return rows.groupby(['target','horizon','policy'],as_index=False).agg(n=('decision_cost','size'),mean_buffer=('buffer','mean'),
        mean_excess_cash=('excess_cash','mean'),mean_yield_drag=('idle_cash_yield_drag','mean'),mean_shortfall=('shortfall','mean'),total_decision_cost=('decision_cost','sum'),mean_decision_cost=('decision_cost','mean'))

def cost_sensitivity(predictions,metrics,df=None,pretest_predictions=None,ratios=(1,3,5)):
    allrows=[]
    for ratio in ratios:
        frame=policy_backtest(predictions,metrics,df=df,pretest_predictions=pretest_predictions,shortfall_cost=float(ratio))
        if not frame.empty:
            s=summarize_policy(frame); s['shortfall_to_holding_cost_ratio']=ratio; allrows.append(s)
    return pd.concat(allrows,ignore_index=True) if allrows else pd.DataFrame()
