# Data source documentation

## AMFI (verified)

Official AMFI monthly reports for January 2021–September 2026 are included under data/raw/amfi_monthly_reports/. Their extracted report tables are under data/raw/amfi_report_tables/. Source URLs and SHA-256 checksums are recorded in data/raw/amfi_monthly_reports/manifest.csv. The extracted Liquid and Overnight series are stored in data/raw/AMFI.csv.

Rebuild the modeling panel with python src/prepare_data.py. This rebuilds the AMFI category panel from included report tables and merges the supplementary CSVs. The AMFI report archive is the source of record.

## Supplementary input panels (provided, not independently audited)

- RBI.csv: repo rate, call-rate average, and liquidity adjustment facility aggregates. Official reference: https://data.rbi.org.in/DBIE/#/dbie/home
- NSE.csv: index levels, monthly moves, and volatility features. Official reference: https://www.nseindia.com/reports-indices-historical-index-data
- Tax_calender.csv: scheduled event flags. Official reference: https://www.incometax.gov.in/iec/foportal/
- Money_market_yield.csv: 91-day T-bill and 3-month commercial-paper yields. The original provider and retrieval record were not supplied. Verify against CCIL/FBIL or another authorized source before relying on yield-cost estimates.

The supplementary CSVs have no row-level source links or retrieval timestamps. The dashboard and reports disclose this limitation. Do not treat its driver ablations or yield-cost estimates as fully source-audited until those panels are checked.
