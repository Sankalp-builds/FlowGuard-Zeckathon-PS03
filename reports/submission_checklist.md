# PS 03 readiness checklist

## Implemented

- [x] Next-three-month monthly forecasts for Liquid and Overnight, with point forecasts and 80%/95% intervals.
- [x] Seasonal-naive, ETS, and HistGradientBoosting comparisons over rolling origins for the last 24 target months.
- [x] Calendar, rates, banking-liquidity, and equity driver ablations.
- [x] Lower-tail forecast buffer and historical cost comparison against prior-year same-month outflow.
- [x] 3x shortfall penalty and holding-cost proxy follow PS 03; sensitivity is included.
- [x] Monthly fund-manager dashboard with forecasts, uncertainty, buffers, drivers, benchmark metrics, and interval calibration.
- [x] React/TypeScript dashboard included alongside the Python pipeline; its generated data bundle rebuilds from the project outputs.
- [x] Frontend cash-buffer and formatting logic checks (5) pass under Node's TypeScript stripping.
- [x] March 15 handled as the advance-tax decision context for monthly flows; no invented daily concentration split.
- [x] Official AMFI monthly report files for Jan 2021–Sep 2026 included, with extracted rows, source URLs, and SHA-256 checksums.

## Before presenting

- [ ] Verify RBI, NSE, money-market, and tax-calendar inputs against their cited primary sources. Their original retrieval records were not included.
- [x] Regenerate every output after AMFI panel correction using python src/run_pipeline.py.
- [x] Run python -m unittest discover -s tests -v (11 tests pass) and smoke-test all three dashboard tabs.
- [x] Refresh the panel through September 2026, the latest month listed in the AMFI archive as of October 29, 2026.
- [ ] Do not claim driver results are independently audited until the supplementary source series are verified.
- [ ] Run `npm install`, `npm run lint`, and `npm run build` inside `dashboard/` on a network-enabled machine before publishing; package registry access was unavailable in this build environment.
