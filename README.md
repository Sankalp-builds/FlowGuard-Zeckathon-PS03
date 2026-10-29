# FlowGuard

FlowGuard is a monthly net-flow forecasting and cash-buffer decision-support project for Indian Liquid and Overnight mutual fund categories, built for Zeckathon PS 03. It includes the Python forecasting pipeline and the React dashboard from Google AI Studio, packaged together with the matching data and generated outputs.

## Project layout

- `src/`: Python data preparation, forecasting, model evaluation, and buffer decision code.
- `dashboard/`: React, TypeScript, and Tailwind dashboard.
- `data/raw/`: official AMFI monthly reports and source panels.
- `data/processed/`: 69-month modeling panel, January 2021–September 2026.
- `outputs/`: generated forecasts, uncertainty intervals, backtests, policy comparisons, and metadata.
- `reports/`: validation notes, model comparison, and submission checklist.

## Run the dashboard

The checked-in dashboard data bundle is `dashboard/src/data/flowguardData.ts`, generated from the included project outputs. The dashboard can run without rerunning the forecasting pipeline.

Requirements: Node.js 20.19+ or 22.12+.

```bash
cd dashboard
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://127.0.0.1:3000`). To create a production build:

```bash
npm run lint
npm test
npm run build
```

## Rebuild the forecasts and refresh dashboard data

Requirements: Python 3.11+ and Node.js.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python src/prepare_data.py
python src/run_pipeline.py
python -m unittest discover -s tests -v
node dashboard/scripts/build_data.js
```

Then rebuild the dashboard from its directory with `npm run build`. The data-bundle script reads the root project's `outputs/` and `data/processed/` files and writes only to `dashboard/src/data/flowguardData.ts`.

## Dashboard contents

The React dashboard has Overview, Forecasts, Cash Buffer, Model Evidence, and Data & Method views. It displays the next three monthly forecasts with point estimates and 80%/95% prediction intervals, potential-outflow buffer estimates, historical decision-cost comparisons, interval calibration, and predictive driver ablations.

March 15 is the advance-tax decision context. The optional March 2027 output is a monthly scenario, not a single-day or five-day redemption forecast.

## Methods and limitations

The pipeline compares seasonal naive, additive ETS, and regularized HistGradientBoosting models, selected separately by category and forecast horizon using rolling-origin MAE. Model selection and reported comparison use the same last-24-month folds, so reported scores are validation estimates rather than an independent final holdout. Prediction interval tails are uncertain with 69 monthly observations.

Liquid and Overnight AMFI flows were extracted from official archived monthly reports; the original workbooks, CSV extracts, source URLs, and SHA-256 manifest are included. Supplementary RBI, NSE, money-market yield, and tax-calendar panels lack retrieval-level audit metadata. Driver comparisons are predictive, not causal. Cash-yield drag uses a 91-day T-bill yield proxy because no direct cash-yield series is supplied. See `reports/data_validation.md` and `data/source_documentation.md`.

Positive net flow means inflow; negative means outflow. Monetary units are ₹ crore.
