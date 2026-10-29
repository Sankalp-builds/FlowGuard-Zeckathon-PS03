# Data validation and release status

## AMFI fund-flow panel: source verified

The AMFI input has been rebuilt from the official monthly report archive for January 2021 through September 2026:

- 69 monthly reports and 138 Liquid/Overnight category rows are archived in data/raw/amfi_monthly_reports/.
- CSV report tables extracted from those Excel files are in data/raw/amfi_report_tables/.
- data/raw/amfi_monthly_reports/manifest.csv records each month, source URL, archive filename, and SHA-256.
- src/extract_amfi_reports.py extracts the two category rows and checks net flow equals mobilized minus redemptions within report rounding.
- src/prepare_data.py then builds the 69 x 24 processed modeling panel from the AMFI rows and the supplied supplementary datasets.

The old supplied March 2021 values were incorrect. The official AMFI report now provides Liquid net flow -₹19,383.68 crore and Overnight net flow +₹5,027.15 crore. The rebuilt raw and processed panels use those official values.

## Remaining provenance limits

The RBI, NSE, money-market-yield, and tax-calendar CSVs were supplied in the original project without retrieval dates, row-level citations, or source checksums. Their values have not all been independently verified against primary-source records. Driver ablations and the T-bill yield-drag proxy therefore depend on these supplied supplementary series.

The official AMFI panel is now primary-source based; do not describe unverified supplementary inputs as independently audited. For presentation, disclose this limitation or replace/validate the supplementary panels before making strong driver-value claims.

## Rebuild and checks

From the project root:

1. Run python src/prepare_data.py to rebuild AMFI.csv and monthly_dataset.csv from the included reports and supplementary CSVs.
2. Run python src/run_pipeline.py to regenerate forecasts, intervals, backtests, metrics, plots, and reports.
3. Run python -m unittest discover -s tests -v.
4. Confirm the metadata data_as_of_month and report outputs match the panel.

Historical source references:
- AMFI monthly archive: https://www.amfiindia.com/research-information/amfi-monthly
- RBI Database on Indian Economy: https://data.rbi.org.in/DBIE/#/dbie/home
- NSE historical index data: https://www.nseindia.com/reports-indices-historical-index-data
- Income Tax Department portal: https://www.incometax.gov.in/iec/foportal/
- Money_market_yield.csv's original provider is not recorded; verify with CCIL/FBIL or another authorized source.
