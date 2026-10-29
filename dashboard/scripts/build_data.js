import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const dashboardDirectory = path.resolve(scriptDirectory, '..');
const projectDirectory = path.resolve(dashboardDirectory, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectDirectory, relativePath), 'utf8');
}

function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];
  
  function parseLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      let val = values[idx];
      if (val !== undefined && val !== '') {
        // If it matches YYYY-MM or YYYY-MM-DD, keep as string
        if (/^\d{4}-\d{2}/.test(val)) {
          obj[h || `col_${idx}`] = val;
        } else {
          const num = Number(val);
          obj[h || `col_${idx}`] = !isNaN(num) && val.trim() !== '' ? num : val;
        }
      } else {
        obj[h || `col_${idx}`] = null;
      }
    });
    rows.push(obj);
  }
  return rows;
}

const metadata = JSON.parse(readProjectFile('outputs/forecast_metadata.json'));
const next3MonthForecasts = parseCSV(readProjectFile('outputs/next_3_month_forecasts.csv'));
const cashBufferRecommendations = parseCSV(readProjectFile('outputs/cash_buffer_recommendation.csv'));
const modelMetrics = parseCSV(readProjectFile('outputs/model_metrics.csv'));
const intervalMetrics = parseCSV(readProjectFile('outputs/interval_metrics.csv'));
const driverOOSComparison = parseCSV(readProjectFile('outputs/driver_oos_comparison.csv'));
const bufferPolicyComparison = parseCSV(readProjectFile('outputs/buffer_policy_comparison.csv'));
const bufferCostSensitivity = parseCSV(readProjectFile('outputs/buffer_cost_sensitivity.csv'));
const march15Scenario = parseCSV(readProjectFile('outputs/march_15_scenario.csv'));
const march15CashBuffer = parseCSV(readProjectFile('outputs/march_15_cash_buffer.csv'));
const monthlyDataset = parseCSV(readProjectFile('data/processed/monthly_dataset.csv'));
const flowSummary = parseCSV(readProjectFile('outputs/flow_summary.csv'));
const dataQuality = parseCSV(readProjectFile('outputs/data_quality.csv'));

const tsContent = `// Auto-generated data bundle directly from outputs/ and data/processed/
// Do not edit manually. From the project root, refresh using: node dashboard/scripts/build_data.js

export interface ForecastMetadata {
  data_as_of_month: string;
  forecast_created_local_date: string;
  release_status: string;
  source_validation_report: string;
  target_sign: string;
  feature_timing: string;
  model_selection: string;
  intervals: string;
  missingness: string;
  decision_cost: {
    shortfall_multiplier: number;
    idle_cash_yield_proxy: string;
    sensitivity_shortfall_multipliers: number[];
    note: string;
  };
}

export interface Next3MonthForecast {
  forecast_month: string;
  target: string;
  horizon: number;
  selected_model: string;
  point_forecast: number;
  lower05: number;
  lower80: number;
  upper80: number;
  lower95: number;
  upper95: number;
  interval_method: string;
  training_through: string;
}

export interface CashBufferRecommendation {
  forecast_month: string;
  target: string;
  horizon: number;
  selected_model: string;
  point_net_flow: number;
  p95_potential_outflow_buffer: number;
  one_sided_lower05_net_flow: number;
  confidence_interval_lower95: number;
  confidence_interval_upper95: number;
  units: string;
  reason: string;
}

export interface ModelMetric {
  target: string;
  model: string;
  horizon: number;
  n_test: number;
  MAE: number;
  RMSE: number;
  MAPE_nonzero_actual_pct: number;
}

export interface IntervalMetric {
  target: string;
  model: string;
  horizon: number;
  interval: string;
  n_test: number;
  empirical_coverage: number;
  mean_width: number;
  pinball_loss_lower: number;
  pinball_loss_upper: number;
  mean_edge_pinball_loss: number;
}

export interface DriverOOSComparison {
  target: string;
  horizon: number;
  driver_set: string;
  n_test: number;
  MAE: number;
  RMSE: number;
  baseline_MAE: number;
  MAE_reduction_vs_base_pct: number;
}

export interface BufferPolicyComparison {
  target: string;
  horizon: number;
  policy: string;
  n: number;
  mean_buffer: number;
  mean_excess_cash: number;
  mean_yield_drag: number;
  mean_shortfall: number;
  total_decision_cost: number;
  mean_decision_cost: number;
}

export interface BufferCostSensitivity {
  target: string;
  horizon: number;
  policy: string;
  n: number;
  mean_buffer: number;
  mean_excess_cash: number;
  mean_yield_drag: number;
  mean_shortfall: number;
  total_decision_cost: number;
  mean_decision_cost: number;
  shortfall_to_holding_cost_ratio: number;
}

export interface March15Scenario {
  scenario: string;
  forecast_month: string;
  target: string;
  horizon: number;
  selected_model: string;
  point_forecast: number;
  lower05: number;
  lower80: number;
  upper80: number;
  lower95: number;
  upper95: number;
  interval_method: string;
  training_through: string;
  frequency_note: string;
}

export interface MonthlyDatasetRow {
  month: string;
  mobilized_liquid: number;
  mobilized_overnight: number;
  redemptions_liquid: number;
  redemptions_overnight: number;
  net_flow_liquid: number;
  net_flow_overnight: number;
  aum_liquid: number;
  aum_overnight: number;
  repo_rate: number;
  call_rate_avg: number;
  laf_net_liquidity_avg: number;
  laf_net_liquidity_monthend: number;
  tbill_91d_yield: number;
  cp_3m_yield: number;
  cp_tbill_spread: number;
  nifty_close: number;
  nifty_monthly_return_pct: number;
  nifty_monthly_return: number;
  is_equity_down: number;
  nifty_volatility_3m: number | null;
  calendar_advance_tax___standard_scheduled_due_date: number;
  calendar_financial_year_end: number;
  calendar_quarter_end: number;
}

export const FORECAST_METADATA: ForecastMetadata = ${JSON.stringify(metadata, null, 2)};
export const NEXT_3_MONTH_FORECASTS: Next3MonthForecast[] = ${JSON.stringify(next3MonthForecasts, null, 2)};
export const CASH_BUFFER_RECOMMENDATIONS: CashBufferRecommendation[] = ${JSON.stringify(cashBufferRecommendations, null, 2)};
export const MODEL_METRICS: ModelMetric[] = ${JSON.stringify(modelMetrics, null, 2)};
export const INTERVAL_METRICS: IntervalMetric[] = ${JSON.stringify(intervalMetrics, null, 2)};
export const DRIVER_OOS_COMPARISON: DriverOOSComparison[] = ${JSON.stringify(driverOOSComparison, null, 2)};
export const BUFFER_POLICY_COMPARISON: BufferPolicyComparison[] = ${JSON.stringify(bufferPolicyComparison, null, 2)};
export const BUFFER_COST_SENSITIVITY: BufferCostSensitivity[] = ${JSON.stringify(bufferCostSensitivity, null, 2)};
export const MARCH_15_SCENARIO: March15Scenario[] = ${JSON.stringify(march15Scenario, null, 2)};
export const MARCH_15_CASH_BUFFER: CashBufferRecommendation[] = ${JSON.stringify(march15CashBuffer, null, 2)};
export const MONTHLY_DATASET: MonthlyDatasetRow[] = ${JSON.stringify(monthlyDataset, null, 2)};
export const FLOW_SUMMARY = ${JSON.stringify(flowSummary, null, 2)};
export const DATA_QUALITY = ${JSON.stringify(dataQuality, null, 2)};
`;

const outputFile = path.join(dashboardDirectory, 'src', 'data', 'flowguardData.ts');
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, tsContent, 'utf8');
console.log(`Successfully regenerated ${path.relative(projectDirectory, outputFile)} from the project outputs`);
