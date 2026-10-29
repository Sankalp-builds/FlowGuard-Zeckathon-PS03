# FlowGuard dashboard build prompt

Build a polished, responsive dashboard for **FlowGuard**, a monthly fund-flow forecasting and cash-buffer decision-support project created for Zeckathon PS 03. Use React and Tailwind CSS for the interface. The dashboard is for fund managers and competition judges reviewing forecasts, uncertainty, cash-buffer recommendations, validation evidence, and data provenance.

## Product purpose and guardrails

FlowGuard forecasts monthly net flows for Indian Liquid and Overnight mutual fund categories. Positive values mean net inflow; negative values mean net outflow. All monetary values are in **₹ crore**. The primary view is the next three monthly releases for both categories, with point forecasts and 80%/95% prediction intervals. The dashboard also explains a potential-outflow buffer, historical policy costs, rolling-origin model comparisons, interval calibration, and predictive driver ablations.

The March 15 reference in the problem statement is an advance-tax decision context. It is **not** a daily or five-day redemption forecast. Present March 2027 only as an optional six-month monthly scenario, and label it clearly as a monthly estimate.

Do not invent data, metrics, causal explanations, intramonth patterns, or validation claims. Make the supplementary-source caveat visible: official AMFI monthly reports underpin the Liquid and Overnight flow series, while supplied RBI, NSE, money-market yield, and tax-calendar panels lack retrieval-level audit metadata. Driver and yield-cost findings must be qualified. Model selection and reported comparison use the same last-24-month rolling-origin folds, so scores are validation estimates rather than an independent holdout. Prediction interval tails are uncertain with only 69 monthly observations. The cash-yield input is a 91-day T-bill proxy, not a direct cash return series.

## Visual direction: competition poster

Use the uploaded CeLESTA competition poster as visual inspiration for a dark, retro-futurist, pixel-tech interface. Keep the result readable and professional for financial analysis; use pixel or arcade styling only for small labels, icons, and decorative details.

### Color tokens

- Page background: near-black blue-green `#071216`.
- Main surface: deep teal-black `#0B2023`.
- Raised surface: `#103238`.
- Primary teal: `#00D4C3`.
- Bright cyan highlight: `#48F0DE`.
- Mint text/highlight: `#A9F2E7`.
- Primary text: `#F2FBF9`.
- Secondary text: `#A8C6C3`.
- Borders/grid: `#1D5555`.
- Positive/inflow: mint/teal; outflow/negative: warm coral `#FF7B72` so polarity is not encoded by teal alone.
- Warning/provenance caveat: amber `#F2C66D`.

Use teal glow sparingly for selected navigation, key actions, and chart focus. Do not use purple, hotel imagery, or an opaque full-screen video background. Use clean high-contrast surfaces and restrained pixel-corner or scanline accents only where they do not reduce legibility.

### Typography

- Manrope for navigation, page titles, and controls.
- Inter for body copy, tables, and explanations.
- Space Mono (or a similar readable monospace) for dates, compact data labels, and small technical badges.
- Use tabular numerals for financial values. Avoid novelty display fonts for long text or chart labels.

## Application shell

Create a full-viewport analytics dashboard, not a marketing hero page. On desktop, use a compact left navigation rail/sidebar and a flexible main content area. On mobile, collapse navigation behind an accessible menu button and stack cards/tables without horizontal page overflow. Include:

- Product mark and **FlowGuard** name.
- Navigation: Overview, Forecasts, Cash Buffer, Model Evidence, Data & Method.
- Top bar with a reporting-period selector if supported by available data, last data month, and a visible data-status badge.
- A concise page heading such as **Monthly liquidity outlook** with subtext explaining that this is monthly decision support.
- Loading, missing-file, and empty-data states with clear recovery guidance.

## Overview page

Lead with an at-a-glance view of the forecast vintage and decision context:

- KPI cards for data through month, monthly observations, and evaluation window. Read the actual values from the provided metadata/panel; do not hard-code them.
- A prominent three-month forecast table for Liquid and Overnight: forecast month, selected model, point forecast, 80% interval, and 95% interval. Format values in ₹ crore and distinguish inflows from outflows.
- A time-series visualization per category showing observed monthly net flow, point forecast, 80% interval band, 95% interval band if legible, and a zero-flow reference line. Use separate clear category toggles or charts; avoid implying daily precision.
- A compact, persistent amber notice describing the supplementary-source audit limitation.
- An explanatory note: March 15 is the advance-tax decision context; the forecast remains monthly.

## Forecasts page

Provide category and forecast-horizon controls. Show point forecasts with 80% and 95% prediction intervals, selected model, training-through date, and a readable uncertainty chart. If users change category or horizon, update the visualization and table consistently. Explain that intervals use empirical out-of-fold residual quantiles and that tail estimates are uncertain with the available sample.

## Cash Buffer page

Explain the recommendation rule in plain language: the recommended potential-outflow buffer is `max(0, -lower 5% net-flow forecast)`. Show, by month and category, the point flow estimate, one-sided lower 5% net-flow bound, and recommended buffer. Compare the modeled policy with the prior-year same-month net-outflow baseline using the available historical policy-cost outputs. Include the 3x shortfall penalty and sensitivity results at 1x, 3x, and 5x when present in the supplied files.

State prominently that idle-cash yield drag uses the latest prior-known 91-day T-bill yield as a proxy because there is no direct cash-yield series. Do not call this a guaranteed reserve amount or financial advice.

## Model Evidence page

Make evaluation transparent and easy to compare:

- Rolling-origin model metrics by category and horizon, including MAE and RMSE; label the last 24 target months as the evaluation window.
- Interval calibration table with nominal interval, empirical coverage, sample count, and mean width.
- Driver ablation comparison against the autoregressive-only baseline. Describe these as **predictive comparisons, not causal effects**. Surface negative as well as positive incremental value.
- Clarify that model selection and reported metrics reuse the same rolling-origin folds; do not describe the scores as an independent holdout.
- Explain that MAPE can be unstable when actual flows are near zero.

## Data & Method page

Summarize the data vintage, 69-month panel coverage, AMFI report provenance, sign convention, ₹ crore units, feature-timing assumptions, forecast methods (seasonal naive, ETS, and regularized HistGradientBoosting), interval method, buffer rule, and known limitations. Link to or surface the existing validation and source documentation. Distinguish verified AMFI flow series from supplementary panels that still need row-level source verification.

If showing the optional March 2027 scenario, mark it **monthly scenario** and explicitly state that it is not a March 15 single-day forecast.

## Interaction and accessibility

- Keep controls keyboard accessible, use semantic headings, provide visible focus states, and label charts/tables for screen readers.
- Use responsive data tables with a mobile card or horizontal-scroll treatment where needed.
- Provide tooltips for interval definitions, units, selected-model logic, and the buffer calculation.
- Use color plus sign/icon/text to distinguish inflow and outflow; do not rely on color alone.
- Keep animations subtle and respect reduced-motion preferences.
- Ensure chart legends, axes, and contrast remain readable on the dark theme.

## Data integration

Use the project's generated files as the source of truth. The current project stores them under `outputs/`:

- `forecast_metadata.json`
- `next_3_month_forecasts.csv`
- `cash_buffer_recommendation.csv`
- `model_metrics.csv`
- `interval_metrics.csv`
- `driver_oos_comparison.csv`
- `buffer_policy_comparison.csv`
- `buffer_cost_sensitivity.csv`
- `monthly_dataset.csv` under `data/processed/`
- Optional `march_15_scenario.csv` and `march_15_cash_buffer.csv`

If a browser cannot load local CSV files directly, add a small documented data-export/API layer or bundle generated JSON at build time. Preserve the existing Python forecasting pipeline and do not fabricate fallback values. Handle missing optional files gracefully, and show a clear status when data are stale or unavailable.

## Delivery

Produce a complete, runnable React/Tailwind dashboard with clear setup instructions. Keep the charts and data transformations maintainable, separate reusable UI components from data-loading logic, and include a short README section explaining the data contract and how to refresh dashboard data from the existing Python pipeline. The result should feel like a competition-ready financial analytics product in the CeLESTA dark-teal visual style—not a hotel booking landing page.
