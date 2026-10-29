"""Rebuild the monthly model panel from the included raw CSV files.

This reproduces the supplied panel but does not certify source authenticity. See
reports/data_validation.md before using the results externally.
"""
from pathlib import Path
from extract_amfi_reports import extract_amfi_rows
import re
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "processed" / "monthly_dataset.csv"


def _calendar_slug(value):
    return "calendar_" + re.sub(r"[ -]", "_", str(value).strip().lower())


def build_dataset(raw_dir=RAW):
    amfi = pd.read_csv(Path(raw_dir) / "AMFI.csv")
    amfi["month"] = pd.PeriodIndex(amfi["month"].astype(str), freq="M").astype(str)
    wide = amfi.pivot(index="month", columns="category",
                      values=["mobilized", "redemptions", "net_flow", "aum"])
    wide.columns = [f"{field}_{category.lower()}" for field, category in wide.columns]
    wide = wide.reset_index()

    frames = [wide]
    for name in ["RBI.csv", "Money_market_yield.csv", "NSE.csv"]:
        frame = pd.read_csv(Path(raw_dir) / name)
        frame["month"] = pd.PeriodIndex(frame["month"].astype(str), freq="M").astype(str)
        frames.append(frame)

    result = frames[0]
    for frame in frames[1:]:
        result = result.merge(frame, on="month", how="outer", validate="one_to_one")

    calendar = pd.read_csv(Path(raw_dir) / "Tax_calender.csv")
    calendar["date"] = pd.to_datetime(calendar["date"], errors="raise")
    calendar["month"] = calendar["date"].dt.to_period("M").astype(str)
    counts = calendar.assign(value=1).pivot_table(
        index="month", columns="event_type", values="value", aggfunc="sum", fill_value=0
    )
    counts.columns = [_calendar_slug(col) for col in counts.columns]
    result = result.merge(counts.reset_index(), on="month", how="left", validate="one_to_one")

    for col in counts.columns:
        result[col] = result[col].fillna(0.0)
    result = result.sort_values("month").reset_index(drop=True)

    desired = [
        "month", "mobilized_liquid", "mobilized_overnight",
        "redemptions_liquid", "redemptions_overnight",
        "net_flow_liquid", "net_flow_overnight", "aum_liquid", "aum_overnight",
        "repo_rate", "call_rate_avg", "laf_net_liquidity_avg", "laf_net_liquidity_monthend",
        "tbill_91d_yield", "cp_3m_yield", "cp_tbill_spread", "nifty_close",
        "nifty_monthly_return_pct", "nifty_monthly_return", "is_equity_down",
        "nifty_volatility_3m",
        "calendar_advance_tax___standard_scheduled_due_date",
        "calendar_financial_year_end", "calendar_quarter_end",
    ]
    result = result[desired]
    return result


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    extract_amfi_rows()
    result = build_dataset()
    result.to_csv(OUT, index=False)
    print(f"Wrote {len(result)} months to {OUT}")
    print("AMFI monthly reports are sourced and checksummed in data/raw/amfi_monthly_reports/manifest.csv.")
    print("Supplementary macro/market source panels require the caveats in reports/data_validation.md.")


if __name__ == "__main__":
    main()
