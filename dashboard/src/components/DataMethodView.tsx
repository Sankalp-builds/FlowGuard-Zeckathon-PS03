import React, { useState } from 'react';
import {
  FORECAST_METADATA,
  MONTHLY_DATASET,
  MARCH_15_SCENARIO,
  DATA_QUALITY,
} from '../data/flowguardData.ts';
import { formatCrore } from '../utils/formatters.ts';
import {
  Database,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  GitBranch,
  Terminal,
  Calendar,
  Layers,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface DataMethodViewProps {
  onOpenAuditModal: () => void;
}

export const DataMethodView: React.FC<DataMethodViewProps> = ({ onOpenAuditModal }) => {
  const [activeTab, setActiveTab] = useState<'methods' | 'sources' | 'pipeline' | 'scenario'>('methods');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Card */}
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1D5555]">
          <div>
            <h2 className="text-lg font-bold text-[#F2FBF9] font-heading flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00D4C3]" />
              Data Provenance, Methodology & Pipeline Architecture
            </h2>
            <p className="text-xs text-[#A8C6C3] mt-0.5">
              Comprehensive transparency on historical data coverage, feature timing, algorithms, and limitations
            </p>
          </div>

          <button
            onClick={onOpenAuditModal}
            className="px-3.5 py-1.5 bg-[#103238] hover:bg-[#1D5555] text-[#F2C66D] border border-[#F2C66D]/40 rounded-lg text-xs font-mono-code font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Open Provenance Audit</span>
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 text-xs font-mono-code">
          {[
            { id: 'methods' as const, label: '01. Modeling & Uncertainty Rules' },
            { id: 'sources' as const, label: '02. Source Provenance & Caveats' },
            { id: 'scenario' as const, label: '03. Advance-Tax Scenario (Mar 2027)' },
            { id: 'pipeline' as const, label: '04. Pipeline Refresh & Data Contract' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#00D4C3] text-[#071216] font-bold shadow-sm'
                  : 'bg-[#071216] text-[#A8C6C3] border border-[#1D5555] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Modeling & Uncertainty Rules */}
      {activeTab === 'methods' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Algorithm 1: Seasonal Naive */}
            <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#48F0DE] font-mono-code">Seasonal Naive</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30 font-mono-code">
                  Liquid Winner
                </span>
              </div>
              <p className="text-xs text-[#A8C6C3] leading-relaxed">
                Projects the exact net flow observed 12 months prior for that calendar month (<code className="text-[#A9F2E7]">y_(t+h) = y_(t+h-12)</code>).
              </p>
              <div className="text-[11px] text-[#F2FBF9] bg-[#071216] p-2 rounded border border-[#1D5555]">
                Dominates in Liquid mutual funds where institutional treasury tax-planning behavior follows strict, repeatable annual quarterly cycles.
              </div>
            </div>

            {/* Algorithm 2: HistGradientBoosting */}
            <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#48F0DE] font-mono-code">HistGradientBoosting</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30 font-mono-code">
                  Overnight Winner
                </span>
              </div>
              <p className="text-xs text-[#A8C6C3] leading-relaxed">
                Histogram-based gradient boosted decision trees regularized with max leaf depth and l2 penalties, trained on lagged macro & autoregressive features.
              </p>
              <div className="text-[11px] text-[#F2FBF9] bg-[#071216] p-2 rounded border border-[#1D5555]">
                Achieves superior performance for Overnight funds at 1-month and 3-month horizons, adapting to non-linear interest rate and spread shifts.
              </div>
            </div>

            {/* Algorithm 3: Additive ETS */}
            <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#A8C6C3] font-mono-code">Additive ETS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#103238] text-[#A8C6C3] border border-[#1D5555] font-mono-code">
                  Benchmark
                </span>
              </div>
              <p className="text-xs text-[#A8C6C3] leading-relaxed">
                Exponential smoothing state space model with additive error, trend, and seasonal components.
              </p>
              <div className="text-[11px] text-[#F2FBF9] bg-[#071216] p-2 rounded border border-[#1D5555]">
                Serves as a robust parametric benchmark against which naive seasonality and machine learning trees are systematically evaluated.
              </div>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#F2FBF9] font-mono-code uppercase tracking-wider">
              Methodological Standards & Mathematical Invariants
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#071216] p-3 rounded-lg border border-[#1D5555] space-y-1.5">
                <strong className="text-[#00D4C3] block font-mono-code">Target Sign Convention & Monetary Units</strong>
                <p className="text-[#A8C6C3] leading-relaxed">
                  All monetary amounts are strictly in <strong>₹ crore</strong>.
                  <br />
                  <strong>Positive values (+)</strong> represent Net Inflow.
                  <br />
                  <strong>Negative values (-)</strong> represent Net Outflow.
                </p>
              </div>

              <div className="bg-[#071216] p-3 rounded-lg border border-[#1D5555] space-y-1.5">
                <strong className="text-[#00D4C3] block font-mono-code">Feature Timing & No-Lookahead Discipline</strong>
                <p className="text-[#A8C6C3] leading-relaxed">
                  All economic and financial features (repo rates, call rates, LAF liquidity, Nifty volatility) are lagged so that forecasts at origin <em>t</em> only utilize information available up through month <em>t</em>. Future calendar events (advance-tax schedules) are known deterministic dates.
                </p>
              </div>

              <div className="bg-[#071216] p-3 rounded-lg border border-[#1D5555] space-y-1.5">
                <strong className="text-[#00D4C3] block font-mono-code">Empirical Prediction Intervals</strong>
                <p className="text-[#A8C6C3] leading-relaxed">
                  Intervals are calculated directly from empirical out-of-fold forecast residual quantiles rather than assuming normal bell curves, preserving real fat-tail redemption asymmetry.
                </p>
              </div>

              <div className="bg-[#071216] p-3 rounded-lg border border-[#1D5555] space-y-1.5">
                <strong className="text-[#00D4C3] block font-mono-code">Cash Buffer Recommendation Rule</strong>
                <p className="text-[#A8C6C3] leading-relaxed">
                  <code className="text-[#A9F2E7]">Recommended Buffer = max(0, -Lower 5% Net Flow Forecast)</code>
                  <br />
                  Minimizes holding yield drag while securing 95% protection against empirical tail redemption shocks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Source Provenance & Caveats */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#F2FBF9] font-mono-code uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00D4C3]" />
              Data Source Lineage & Provenance Tiers
            </h3>

            <div className="space-y-3 text-xs">
              {/* Tier 1: AMFI */}
              <div className="bg-[#071216] border border-[#00D4C3]/40 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#48F0DE] font-mono-code text-sm">
                    Tier 1: AMFI Mutual Fund Flow Series (Verified Primary Source)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30 font-mono-code text-[10px]">
                    SHA-256 Verified
                  </span>
                </div>
                <p className="text-[#A8C6C3] leading-relaxed">
                  Extracted from 69 official monthly Excel bulletins published by the Association of Mutual Funds in India (AMFI). All 138 Liquid and Overnight category records (Mobilized, Redemptions, Net Flow, AUM) have been audited with cryptographic hashes and checked for mathematical identity consistency.
                </p>
                <div className="text-[11px] text-[#A8C6C3] font-mono-code">
                  Archive path: <code className="text-[#F2FBF9]">data/raw/amfi_monthly_reports/</code> · Manifest: <code className="text-[#F2FBF9]">manifest.csv</code>
                </div>
              </div>

              {/* Tier 2: Supplementary Panels */}
              <div className="bg-[#071216] border border-[#F2C66D]/40 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F2C66D] font-mono-code text-sm">
                    Tier 2: Supplementary Macro & Market Panels (Unverified / Proxy)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F2C66D]/15 text-[#F2C66D] border border-[#F2C66D]/30 font-mono-code text-[10px]">
                    Caveat Required
                  </span>
                </div>
                <p className="text-[#A8C6C3] leading-relaxed">
                  The supplementary series provided in the initial project bundle (RBI policy rate, LAF net liquidity, NSE Nifty returns and rolling volatility, and commercial paper yields) lack retrieval-level timestamps and cryptographic audit metadata.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-[#103238] p-2 rounded border border-[#1D5555]">
                    <strong className="text-[#F2FBF9] block">91-Day T-Bill Yield Proxy</strong>
                    Used as the idle-cash yield drag benchmark because no direct fund cash return series was supplied.
                  </div>
                  <div className="bg-[#103238] p-2 rounded border border-[#1D5555]">
                    <strong className="text-[#F2FBF9] block">NSE 3M Volatility Missingness</strong>
                    The first two observations (Jan–Feb 2021) are missing in the raw series and imputed within rolling folds.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Quality Report */}
          <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#F2FBF9] font-mono-code uppercase tracking-wider">
              Panel Feature Inventory & Missingness Summary (69 Months)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-code border-collapse">
                <thead>
                  <tr className="border-b border-[#1D5555] text-[#A8C6C3] text-[11px]">
                    <th className="py-2 px-3">FEATURE NAME</th>
                    <th className="py-2 px-3">MISSING VALUES</th>
                    <th className="py-2 px-3">DATA TYPE</th>
                    <th className="py-2 px-3">SOURCE STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D5555]/40 text-xs">
                  {DATA_QUALITY.slice(0, 10).map((col, idx) => (
                    <tr key={idx} className="hover:bg-[#103238]/40">
                      <td className="py-2 px-3 font-semibold text-[#F2FBF9]">{col.column}</td>
                      <td className="py-2 px-3 text-[#A8C6C3]">{col.missing_count}</td>
                      <td className="py-2 px-3 text-[#A8C6C3]">{col.dtype}</td>
                      <td className="py-2 px-3">
                        {col.column.includes('liquid') || col.column.includes('overnight') ? (
                          <span className="text-[#00D4C3]">AMFI Verified</span>
                        ) : (
                          <span className="text-[#F2C66D]">Supplementary</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Advance-Tax Scenario (Mar 2027) */}
      {activeTab === 'scenario' && (
        <div className="space-y-4">
          <div className="bg-[#0B2023] border border-[#F2C66D]/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2C66D]" />
              <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
                Advance-Tax Context: March 2027 (6-Month Monthly Scenario)
              </h3>
            </div>

            <div className="bg-[#071216] p-4 rounded-lg border border-[#F2C66D]/30 text-xs text-[#A8C6C3] space-y-2">
              <div className="text-[#F2C66D] font-bold font-mono-code text-sm">
                CRITICAL GUARDRAIL: MONTHLY AGGREGATE, NOT A SINGLE-DAY MARCH 15 FORECAST
              </div>
              <p className="leading-relaxed text-[#F2FBF9]">
                The competition problem statement cites March 15 as an advance-tax decision milestone. In India, fourth-quarter corporate advance tax payments are due on March 15, causing massive institutional withdrawals from liquid mutual funds.
              </p>
              <p className="leading-relaxed">
                <strong>FlowGuard’s forecasting engine operates on a monthly aggregation frequency.</strong> The March 2027 estimate represents the total monthly flow and required potential-outflow buffer for the entire month of March 2027; it must <em>never</em> be interpreted as a 24-hour daily redemption or five-day treasury projection.
              </p>
            </div>

            {/* Scenario Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-code border-collapse">
                <thead>
                  <tr className="border-b border-[#1D5555] text-[#A8C6C3] text-[11px]">
                    <th className="py-2.5 px-3">SCENARIO TARGET</th>
                    <th className="py-2.5 px-3">HORIZON</th>
                    <th className="py-2.5 px-3">MODEL</th>
                    <th className="py-2.5 px-3 text-right">POINT ESTIMATE</th>
                    <th className="py-2.5 px-3 text-right">LOWER 5% BOUND</th>
                    <th className="py-2.5 px-3 text-right">RECOMMENDED BUFFER</th>
                    <th className="py-2.5 px-3">FREQUENCY NOTE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D5555]/50 text-xs">
                  {MARCH_15_SCENARIO.map((sc, i) => (
                    <tr key={i} className="hover:bg-[#103238]/60">
                      <td className="py-3 px-3 font-bold text-[#F2FBF9]">
                        {sc.target === 'net_flow_liquid' ? 'Liquid Funds' : 'Overnight Funds'}
                      </td>
                      <td className="py-3 px-3 text-[#A8C6C3]">h = 6 months</td>
                      <td className="py-3 px-3 text-[#F2FBF9]">{sc.selected_model}</td>
                      <td className="py-3 px-3 text-right text-[#FF7B72] font-bold">
                        {formatCrore(sc.point_forecast, true)}
                      </td>
                      <td className="py-3 px-3 text-right text-[#A8C6C3]">
                        {formatCrore(sc.lower05, true)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-sm text-[#F2C66D]">
                        {formatCrore(Math.max(0, -sc.lower05), false, 0)}
                      </td>
                      <td className="py-3 px-3 text-[#A8C6C3] text-[10px]">
                        {sc.frequency_note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Pipeline Refresh & Data Contract */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#00D4C3]" />
              <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
                Pipeline Execution & Data Refresh Contract
              </h3>
            </div>
            <p className="text-xs text-[#A8C6C3] leading-relaxed">
              FlowGuard maintains strict separation between the Python analytical forecasting pipeline and the React decision-support interface. The dashboard consumes generated artifacts from <code className="text-[#A9F2E7]">outputs/</code> and <code className="text-[#A9F2E7]">data/processed/</code>.
            </p>

            {/* Step-by-step CLI Instructions */}
            <div className="bg-[#071216] border border-[#1D5555] rounded-lg p-4 font-mono-code text-xs space-y-3">
              <div className="text-[#48F0DE] font-semibold text-xs">
                # Instructions to regenerate data from Python forecasting pipeline:
              </div>
              <div className="space-y-2 text-[#A8C6C3]">
                <div>
                  <span className="text-[#A9F2E7]"># Step 1: Rebuild panel from official AMFI reports and supplementary series</span>
                  <div className="text-[#F2FBF9] bg-[#103238] px-3 py-1.5 rounded mt-1">
                    python src/prepare_data.py
                  </div>
                </div>

                <div>
                  <span className="text-[#A9F2E7]"># Step 2: Run rolling-origin forecasting, interval calibration & cash buffer policy</span>
                  <div className="text-[#F2FBF9] bg-[#103238] px-3 py-1.5 rounded mt-1">
                    python src/run_pipeline.py
                  </div>
                </div>

                <div>
                  <span className="text-[#A9F2E7]"># Step 3: Run comprehensive verification unit tests</span>
                  <div className="text-[#F2FBF9] bg-[#103238] px-3 py-1.5 rounded mt-1">
                    python -m unittest discover -s tests -v
                  </div>
                </div>

                <div>
                  <span className="text-[#A9F2E7]"># Step 4: Refresh dashboard data bundle</span>
                  <div className="text-[#F2FBF9] bg-[#103238] px-3 py-1.5 rounded mt-1">
                    node scripts/build_data.js
                  </div>
                </div>
              </div>
            </div>

            {/* Data Contract File Schema */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-[#F2FBF9] font-mono-code uppercase text-[11px]">
                Output Artifacts & File Schema Contract
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { file: 'outputs/forecast_metadata.json', desc: 'Metadata, data vintage, audit limitations, and decision parameters' },
                  { file: 'outputs/next_3_month_forecasts.csv', desc: 'Point forecasts, 80% & 95% interval bounds for horizons 1, 2, 3' },
                  { file: 'outputs/cash_buffer_recommendation.csv', desc: '95th percentile potential-outflow buffer recommendations' },
                  { file: 'outputs/model_metrics.csv', desc: 'Rolling-origin out-of-sample MAE, RMSE, and MAPE across 24 releases' },
                  { file: 'outputs/interval_metrics.csv', desc: 'Empirical coverage, mean band width, and pinball loss metrics' },
                  { file: 'outputs/driver_oos_comparison.csv', desc: 'Predictive ablation error reductions vs autoregressive baseline' },
                  { file: 'outputs/buffer_policy_comparison.csv', desc: 'Policy backtest comparing model buffer vs prior-year same-month baseline' },
                  { file: 'outputs/buffer_cost_sensitivity.csv', desc: 'Decision cost sensitivity across 1x, 3x, and 5x shortfall penalties' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#071216] p-2.5 rounded border border-[#1D5555]">
                    <code className="text-[#00D4C3] font-mono-code text-[11px] block">{item.file}</code>
                    <span className="text-[#A8C6C3] text-[11px] mt-0.5 block">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
