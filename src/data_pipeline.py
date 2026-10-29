"""Load and validate the completed monthly FlowGuard dataset; create as-of features."""
from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / 'data' / 'processed' / 'monthly_dataset.csv'
TARGETS = ['net_flow_liquid', 'net_flow_overnight']
FLOW_COLS = ['mobilized_liquid','mobilized_overnight','redemptions_liquid','redemptions_overnight',*TARGETS]
RATE_COLS = ['repo_rate','call_rate_avg','tbill_91d_yield','cp_3m_yield','cp_tbill_spread']
LIQUIDITY_COLS = ['laf_net_liquidity_avg','laf_net_liquidity_monthend']
EQUITY_COLS = ['nifty_monthly_return_pct','nifty_volatility_3m','is_equity_down']
DRIVER_GROUPS = {'calendar':[c for c in ['calendar_advance_tax___standard_scheduled_due_date','calendar_financial_year_end','calendar_quarter_end']], 'rates':RATE_COLS, 'liquidity':LIQUIDITY_COLS, 'equity':EQUITY_COLS}

def load_dataset(path=DATA_PATH):
    df = pd.read_csv(path)
    required = {'month', *TARGETS, 'mobilized_liquid','mobilized_overnight','redemptions_liquid','redemptions_overnight'}
    missing = required - set(df.columns)
    if missing: raise ValueError(f'Missing required dataset columns: {sorted(missing)}')
    dates = pd.PeriodIndex(df.month.astype(str), freq='M')
    if dates.duplicated().any(): raise ValueError('Dataset contains duplicate months')
    expected = pd.period_range(dates.min(), dates.max(), freq='M')
    if not dates.equals(expected): raise ValueError('Monthly target index has a gap or is unordered')
    df = df.copy(); df['month'] = dates.astype(str)
    numeric = [c for c in df.columns if c != 'month']
    for c in numeric: df[c] = pd.to_numeric(df[c], errors='coerce')
    if df[TARGETS].isna().any().any(): raise ValueError('Net-flow targets contain missing values')
    for cat in ['liquid','overnight']:
        gap = (df[f'net_flow_{cat}']-(df[f'mobilized_{cat}']-df[f'redemptions_{cat}'])).abs()
        if gap.max() > max(1e-5, df[f'net_flow_{cat}'].abs().max()*1e-6):
            raise ValueError(f'{cat} net flow must equal mobilized minus redemptions')
    return df

def feature_frame(df, horizon=0):
    """Each row's features use target/driver observations through the prior month only.

    Calendar counts for the row month are included because statutory dates are scheduled in
    advance. Month-end rates, market measures, AUM and flow totals are lagged one month.
    """
    periods = pd.PeriodIndex(df.month.astype(str), freq='M')
    x = pd.DataFrame(index=df.index)
    x['month_sin'] = np.sin(2*np.pi*periods.month/12)
    x['month_cos'] = np.cos(2*np.pi*periods.month/12)
    x['time_index'] = np.arange(len(df), dtype=float)
    for target in TARGETS:
        for lag in [1,2,3,6,12]:
            x[f'{target}_lag{lag}'] = df[target].shift(lag)
    for target in TARGETS:
        other = TARGETS[1] if target == TARGETS[0] else TARGETS[0]
        # Cross-category information must also be known before the forecast month.
        for lag in [1,3,12]: x[f'{other}_lag{lag}'] = df[other].shift(lag)
    for c in RATE_COLS+LIQUIDITY_COLS+EQUITY_COLS:
        if c in df: x[f'{c}_lag1'] = df[c].shift(1)
    for c in [c for c in df.columns if c.startswith('calendar_')]:
        # Holiday/tax calendar rows are published in advance: align planned events in the
        # forecast target month to each historical origin row.
        x[c] = df[c].shift(-horizon).fillna(0)
    return x

def extend_future_calendar(df, horizon=3, calendar_path=None):
    """Append future month rows using only scheduled calendar-event data."""
    if calendar_path is None: calendar_path = ROOT/'data'/'raw'/'Tax_calender.csv'
    future_periods = pd.period_range(pd.Period(df.month.iloc[-1],freq='M')+1, periods=horizon, freq='M')
    out=df.copy(); calendar_cols=[c for c in df if c.startswith('calendar_')]
    if Path(calendar_path).exists():
        cal=pd.read_csv(calendar_path); cal['date']=pd.to_datetime(cal.date,errors='raise'); cal['month']=cal.date.dt.to_period('M')
        events=cal.pivot_table(index='month',columns='event_type',values='date',aggfunc='count',fill_value=0)
        events.columns=['calendar_'+str(c).strip().lower().replace(' ','_').replace('-','_') for c in events.columns]
    else: events=pd.DataFrame()
    rows=[]
    for period in future_periods:
        row={c:np.nan for c in df.columns}; row['month']=str(period)
        for c in calendar_cols: row[c]=0.0
        if period in events.index:
            for c in events.columns:
                if c in row: row[c]=float(events.loc[period,c])
        rows.append(row)
    return pd.concat([out,pd.DataFrame(rows)],ignore_index=True)

def quality_report(df):
    rows=[]
    for col in df:
        rows.append({'column':col,'missing_count':int(df[col].isna().sum()),'dtype':str(df[col].dtype)})
    return pd.DataFrame(rows)
