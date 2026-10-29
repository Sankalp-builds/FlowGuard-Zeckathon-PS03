import React, { useState } from 'react';
import {
  MODEL_METRICS,
  INTERVAL_METRICS,
  DRIVER_OOS_COMPARISON,
  DATA_QUALITY,
} from '../data/flowguardData.ts';
import { formatCrore, formatPercent } from '../utils/formatters.ts';
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Activity,
  Zap,
  Info,
  Scale,
  Percent,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';

export const ModelEvidenceView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'net_flow_liquid' | 'net_flow_overnight'>('all');
  const [intervalModelFilter, setIntervalModelFilter] = useState<string>('all');
  const [driverHorizonFilter, setDriverHorizonFilter] = useState<number | 'all'>('all');

  // Filter model metrics
  const filteredMetrics = MODEL_METRICS.filter((m) => {
    if (selectedCategory !== 'all' && m.target !== selectedCategory) return false;
    return true;
  });

  // Filter interval metrics
  const filteredIntervals = INTERVAL_METRICS.filter((i) => {
    if (selectedCategory !== 'all' && i.target !== selectedCategory) return false;
    if (intervalModelFilter !== 'all' && i.model !== intervalModelFilter) return false;
    return true;
  });

  // Filter driver ablations
  const filteredDrivers = DRIVER_OOS_COMPARISON.filter((d) => {
    if (selectedCategory !== 'all' && d.target !== selectedCategory) return false;
    if (driverHorizonFilter !== 'all' && d.horizon !== driverHorizonFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Methodological Caveat Notice */}
      <div className="bg-[#103238] border border-[#1D5555] rounded-xl p-4 flex items-start gap-3 text-xs text-[#A8C6C3]">
        <Info className="w-5 h-5 text-[#00D4C3] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-[#F2FBF9] font-mono-code uppercase text-[11px] block">
            Validation Protocol & Holdout Transparency
          </span>
          <p className="leading-relaxed">
            All models are evaluated via expanding-origin backtests over the <strong>last 24 target releases (2024-10 to 2026-09)</strong>. Model selection and reported metrics reuse these identical 24 rolling folds; scores are <strong>out-of-sample validation estimates</strong> rather than an isolated, untouched final holdout.
          </p>
          <p className="leading-relaxed text-[#F2C66D]">
            <strong>MAPE Caution:</strong> Mean Absolute Percentage Error (MAPE) can be mathematically unstable or blow up when actual monthly net flows oscillate close to zero (e.g. crossing between slight inflow and outflow). Primary model selection strictly relies on <strong>Mean Absolute Error (MAE)</strong> in ₹ crore.
          </p>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B2023] border border-[#1D5555] p-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-mono-code text-[#A8C6C3]">
          <Layers className="w-4 h-4 text-[#00D4C3]" />
          <span>FILTER BY CATEGORY:</span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-[#071216] border border-[#1D5555] rounded-lg text-xs font-mono-code">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                : 'text-[#A8C6C3] hover:text-white'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setSelectedCategory('net_flow_liquid')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedCategory === 'net_flow_liquid'
                ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                : 'text-[#A8C6C3] hover:text-white'
            }`}
          >
            Liquid Funds
          </button>
          <button
            onClick={() => setSelectedCategory('net_flow_overnight')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedCategory === 'net_flow_overnight'
                ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                : 'text-[#A8C6C3] hover:text-white'
            }`}
          >
            Overnight Funds
          </button>
        </div>
      </div>

      {/* Section 1: Rolling-Origin Model Comparison Table */}
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1D5555]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
                Rolling-Origin Model Evaluation Metrics
              </h3>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30">
                Evaluation Window: Last 24 Releases
              </span>
            </div>
            <p className="text-xs text-[#A8C6C3] mt-0.5">
              MAE and RMSE (₹ crore) evaluated on rolling expanding origins (h=1, 2, 3, and h=6 scenario horizon)
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code border-collapse" aria-label="Model Comparison Metrics Table">
            <thead>
              <tr className="border-b border-[#1D5555] text-[#A8C6C3] text-[11px]">
                <th className="py-2.5 px-3 font-semibold">CATEGORY</th>
                <th className="py-2.5 px-3 font-semibold">HORIZON</th>
                <th className="py-2.5 px-3 font-semibold">MODEL</th>
                <th className="py-2.5 px-3 font-semibold text-right">EVAL SAMPLES</th>
                <th className="py-2.5 px-3 font-semibold text-right">MAE (₹ CR)</th>
                <th className="py-2.5 px-3 font-semibold text-right">RMSE (₹ CR)</th>
                <th className="py-2.5 px-3 font-semibold text-right">MAPE (%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">SELECTION STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D5555]/50 text-xs">
              {filteredMetrics.map((row, i) => {
                const isLiquid = row.target === 'net_flow_liquid';
                // Highlight winning models based on the prompt/outputs
                // Liquid: seasonal_naive wins across h=1,2,3,6
                // Overnight: HistGradientBoosting wins at h=1, h=3; seasonal_naive at h=2, h=6
                const isWinner =
                  (isLiquid && row.model === 'seasonal_naive') ||
                  (!isLiquid && row.horizon === 1 && row.model === 'HistGradientBoosting') ||
                  (!isLiquid && row.horizon === 2 && row.model === 'seasonal_naive') ||
                  (!isLiquid && row.horizon === 3 && row.model === 'HistGradientBoosting') ||
                  (!isLiquid && row.horizon === 6 && row.model === 'seasonal_naive');

                return (
                  <tr
                    key={i}
                    className={`hover:bg-[#103238]/60 transition-colors ${
                      isWinner ? 'bg-[#00D4C3]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-[#F2FBF9] whitespace-nowrap">
                      {isLiquid ? 'Liquid Fund' : 'Overnight Fund'}
                    </td>
                    <td className="py-3 px-3 text-[#A8C6C3]">
                      h = {row.horizon}m {row.horizon === 6 ? '(Mar Scenario)' : ''}
                    </td>
                    <td className="py-3 px-3 font-semibold whitespace-nowrap">
                      <span className={isWinner ? 'text-[#48F0DE] font-bold' : 'text-[#F2FBF9]'}>
                        {row.model}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-[#A8C6C3]">{row.n_test}</td>
                    <td className={`py-3 px-3 text-right font-sans font-bold text-sm tabular-nums whitespace-nowrap ${isWinner ? 'text-[#48F0DE]' : 'text-[#F2FBF9]'}`}>
                      {formatCrore(row.MAE, false, 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-sans font-medium tabular-nums whitespace-nowrap text-[#A8C6C3]">
                      {formatCrore(row.RMSE, false, 0)}
                    </td>
                    <td className="py-3 px-3 text-right text-[#A8C6C3]">
                      {formatPercent(row.MAPE_nonzero_actual_pct, 1)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isWinner ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30 font-bold">
                          <Award className="w-3 h-3 text-[#00D4C3]" />
                          Selected Winner
                        </span>
                      ) : (
                        <span className="text-[#A8C6C3] text-[11px]">Challenger</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Prediction Interval Calibration */}
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1D5555]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
                Prediction Interval Calibration: Nominal vs. Empirical Coverage
              </h3>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30">
                Residual Quantiles
              </span>
            </div>
            <p className="text-xs text-[#A8C6C3] mt-0.5">
              Empirical out-of-fold coverage and mean band width across 80% and 95% nominal prediction intervals
            </p>
          </div>

          {/* Model Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#071216] border border-[#1D5555] rounded-lg text-xs font-mono-code">
            <span className="text-[10px] text-[#A8C6C3] px-2">MODEL:</span>
            {['all', 'seasonal_naive', 'HistGradientBoosting', 'ETS'].map((m) => (
              <button
                key={m}
                onClick={() => setIntervalModelFilter(m)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  intervalModelFilter === m
                    ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                    : 'text-[#A8C6C3] hover:text-white'
                }`}
              >
                {m === 'all' ? 'All Models' : m}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code border-collapse" aria-label="Interval Calibration Table">
            <thead>
              <tr className="border-b border-[#1D5555] text-[#A8C6C3] text-[11px]">
                <th className="py-2.5 px-3 font-semibold">CATEGORY</th>
                <th className="py-2.5 px-3 font-semibold">MODEL</th>
                <th className="py-2.5 px-3 font-semibold">HORIZON</th>
                <th className="py-2.5 px-3 font-semibold">NOMINAL INTERVAL</th>
                <th className="py-2.5 px-3 font-semibold text-right">EVAL SAMPLES</th>
                <th className="py-2.5 px-3 font-semibold text-right">EMPIRICAL COVERAGE</th>
                <th className="py-2.5 px-3 font-semibold text-right">MEAN WIDTH (₹ CR)</th>
                <th className="py-2.5 px-3 font-semibold text-right">PINBALL LOSS (LOWER)</th>
                <th className="py-2.5 px-3 font-semibold text-right">PINBALL LOSS (UPPER)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D5555]/50 text-xs">
              {filteredIntervals.map((row, i) => {
                const nominalPct = parseInt(row.interval.replace('%', ''), 10) / 100;
                const coveragePct = row.empirical_coverage;
                const isWellCalibrated = Math.abs(coveragePct - nominalPct) <= 0.08;

                return (
                  <tr key={i} className="hover:bg-[#103238]/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#F2FBF9] whitespace-nowrap">
                      {row.target === 'net_flow_liquid' ? 'Liquid Fund' : 'Overnight Fund'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#F2FBF9]">{row.model}</td>
                    <td className="py-2.5 px-3 text-[#A8C6C3]">h = {row.horizon}m</td>
                    <td className="py-2.5 px-3 text-[#48F0DE] font-bold">{row.interval}</td>
                    <td className="py-2.5 px-3 text-right text-[#A8C6C3]">{row.n_test}</td>
                    <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          isWellCalibrated
                            ? 'bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30'
                            : 'bg-[#F2C66D]/15 text-[#F2C66D] border border-[#F2C66D]/30'
                        }`}
                      >
                        {(coveragePct * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans font-medium tabular-nums whitespace-nowrap text-[#F2FBF9]">
                      {formatCrore(row.mean_width, false, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#A8C6C3]">
                      {row.pinball_loss_lower.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#A8C6C3]">
                      {row.pinball_loss_upper.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Driver OOS Ablations */}
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1D5555]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
                Predictive Driver Ablations vs. Autoregressive Baseline
              </h3>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#F2C66D]/15 text-[#F2C66D] border border-[#F2C66D]/30">
                Predictive, Not Causal
              </span>
            </div>
            <p className="text-xs text-[#A8C6C3] mt-0.5">
              Testing out-of-sample incremental value when driver groups are added to the lag-only ML model. Positive % indicates error reduction; negative % indicates error degradation.
            </p>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#071216] border border-[#1D5555] rounded-lg text-xs font-mono-code">
            <span className="text-[10px] text-[#A8C6C3] px-2">HORIZON:</span>
            {[
              { label: 'All Horizons', val: 'all' as const },
              { label: 'h = 1m', val: 1 },
              { label: 'h = 3m', val: 3 },
            ].map((h) => (
              <button
                key={String(h.val)}
                onClick={() => setDriverHorizonFilter(h.val as any)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  driverHorizonFilter === h.val
                    ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                    : 'text-[#A8C6C3] hover:text-white'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Driver Ablation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code border-collapse" aria-label="Driver Ablation Table">
            <thead>
              <tr className="border-b border-[#1D5555] text-[#A8C6C3] text-[11px]">
                <th className="py-2.5 px-3 font-semibold">CATEGORY</th>
                <th className="py-2.5 px-3 font-semibold">HORIZON</th>
                <th className="py-2.5 px-3 font-semibold">DRIVER GROUP</th>
                <th className="py-2.5 px-3 font-semibold text-right">MAE (₹ CR)</th>
                <th className="py-2.5 px-3 font-semibold text-right">BASELINE MAE (₹ CR)</th>
                <th className="py-2.5 px-3 font-semibold text-right">MAE REDUCTION (%)</th>
                <th className="py-2.5 px-3 font-semibold">PREDICTIVE VERDICT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D5555]/50 text-xs">
              {filteredDrivers.map((row, i) => {
                const isBase = row.driver_set === 'autoregressive_only';
                const isHelpful = row.MAE_reduction_vs_base_pct > 0;
                const isHarmful = row.MAE_reduction_vs_base_pct < 0;

                return (
                  <tr key={i} className="hover:bg-[#103238]/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#F2FBF9] whitespace-nowrap">
                      {row.target === 'net_flow_liquid' ? 'Liquid Fund' : 'Overnight Fund'}
                    </td>
                    <td className="py-3 px-3 text-[#A8C6C3]">h = {row.horizon}m</td>
                    <td className="py-3 px-3 font-bold capitalize whitespace-nowrap text-[#F2FBF9]">
                      {row.driver_set.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3 text-right font-sans font-medium tabular-nums whitespace-nowrap text-[#F2FBF9]">{formatCrore(row.MAE, false, 0)}</td>
                    <td className="py-3 px-3 text-right font-sans font-medium tabular-nums whitespace-nowrap text-[#A8C6C3]">{formatCrore(row.baseline_MAE, false, 0)}</td>
                    <td className="py-3 px-3 text-right font-bold whitespace-nowrap">
                      {isBase ? (
                        <span className="text-[#A8C6C3]">0.0% (Baseline)</span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            isHelpful
                              ? 'bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30'
                              : 'bg-[#FF7B72]/15 text-[#FF7B72] border border-[#FF7B72]/30'
                          }`}
                        >
                          {row.MAE_reduction_vs_base_pct > 0 ? '+' : ''}
                          {row.MAE_reduction_vs_base_pct.toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[#A8C6C3]">
                      {isBase ? (
                        'Lagged net flow autoregressive baseline'
                      ) : isHelpful ? (
                        <span className="text-[#00D4C3] flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Improves OOS forecast accuracy
                        </span>
                      ) : (
                        <span className="text-[#FF7B72] flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Degrades OOS accuracy (overfitting noise)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Driver Caveat Summary */}
        <div className="bg-[#071216] border border-[#1D5555] rounded-lg p-4 text-xs text-[#A8C6C3] space-y-2">
          <div className="flex items-center gap-2 text-[#F2C66D] font-mono-code font-semibold">
            <AlertTriangle className="w-4 h-4 text-[#F2C66D]" />
            <span>Honest Evaluation: Macro Features Do Not Universally Help Small Samples</span>
          </div>
          <p className="leading-relaxed">
            Calendar signals (advance-tax dates and quarter-ends) provide substantial predictive lift for Liquid Funds at h=1 (+6.41% MAE reduction). However, adding macro liquidity indicators (LAF balances) or policy rates worsened out-of-sample MAE (-7.51% and -4.88% respectively) due to degrees-of-freedom depletion across just 69 monthly points. This demonstrates why FlowGuard reports honest driver degradations rather than assuming macro complexity always outperforms parsimonious seasonal baselines.
          </p>
        </div>
      </div>
    </div>
  );
};
