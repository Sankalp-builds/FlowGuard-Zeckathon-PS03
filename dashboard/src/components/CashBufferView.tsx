import React, { useState } from 'react';
import {
  CASH_BUFFER_RECOMMENDATIONS,
  MARCH_15_CASH_BUFFER,
  BUFFER_POLICY_COMPARISON,
  BUFFER_COST_SENSITIVITY,
  FORECAST_METADATA,
} from '../data/flowguardData.ts';
import { formatCrore, formatMonthName, getFlowPolarity } from '../utils/formatters.ts';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  Percent,
  CheckCircle2,
  DollarSign,
  Scale,
  Sliders,
  Info,
} from 'lucide-react';

export const CashBufferView: React.FC = () => {
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(3);
  const [includeMarchScenario, setIncludeMarchScenario] = useState<boolean>(false);
  const [selectedTargetFilter, setSelectedTargetFilter] = useState<'all' | 'net_flow_liquid' | 'net_flow_overnight'>('all');

  // Filter recommendations
  let recs = [...CASH_BUFFER_RECOMMENDATIONS];
  if (includeMarchScenario) {
    recs.push(...MARCH_15_CASH_BUFFER);
  }
  if (selectedTargetFilter !== 'all') {
    recs = recs.filter((r) => r.target === selectedTargetFilter);
  }

  // Filter sensitivity
  const filteredSensitivity = BUFFER_COST_SENSITIVITY.filter(
    (s) => s.shortfall_to_holding_cost_ratio === selectedMultiplier
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Prominent Rule Explanation Card */}
      <div className="bg-[#0B2023] border border-[#00D4C3]/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D4C3]" />
              <h2 className="text-base font-bold text-[#F2FBF9] font-heading">
                Cash Buffer Recommendation Engine: The 95th Percentile Rule
              </h2>
            </div>
            <p className="text-xs text-[#A8C6C3] leading-relaxed">
              In plain language: fund managers must safeguard against redemption runs while avoiding excessive idle-cash drag. FlowGuard defines the potential-outflow buffer as:
            </p>
            <div className="bg-[#071216] border border-[#1D5555] px-4 py-2.5 rounded-lg font-mono-code text-xs text-[#48F0DE] flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#F2FBF9]">Recommended Cash Buffer</span>
              <span className="text-[#A8C6C3]">=</span>
              <span className="text-[#A9F2E7] font-semibold">max(0, - Lower 5% Net Flow Forecast)</span>
            </div>
            <p className="text-xs text-[#A8C6C3] leading-relaxed">
              When the lower 5% bound is positive (meaning net inflows even in the 95% worst-case scenario), the buffer is <strong>₹0.00</strong>. When the lower 5% bound is negative, the buffer holds exactly enough liquidity to absorb 95% of out-of-fold historical redemption shock magnitudes.
            </p>
          </div>

          {/* Regulatory & Disclaimer Box */}
          <div className="bg-[#103238] border border-[#1D5555] rounded-lg p-3 text-[11px] text-[#A8C6C3] space-y-1.5 lg:w-72 shrink-0">
            <div className="flex items-center gap-1.5 text-[#F2C66D] font-mono-code font-semibold uppercase text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F2C66D]" />
              Decision Support Notice
            </div>
            <p className="leading-tight text-[11px]">
              This model provides statistical decision support. It is <strong>not financial advice</strong> and is not a guaranteed statutory reserve guarantee.
            </p>
            <p className="leading-tight text-[11px] text-[#A9F2E7]">
              Idle-cash yield drag is proxied using the latest prior-known <strong>91-day T-bill yield</strong> because the data contain no direct cash-yield series.
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Buffers Table */}
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1D5555]">
          <div>
            <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
              Potential-Outflow Buffers by Month & Category
            </h3>
            <p className="text-xs text-[#A8C6C3] mt-0.5">
              Point net-flow expectation vs. one-sided lower 5% bound and resulting potential-outflow reserve (₹ crore)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1 p-1 bg-[#071216] border border-[#1D5555] rounded-lg text-xs font-mono-code">
              <button
                onClick={() => setSelectedTargetFilter('all')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  selectedTargetFilter === 'all'
                    ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                    : 'text-[#A8C6C3] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTargetFilter('net_flow_liquid')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  selectedTargetFilter === 'net_flow_liquid'
                    ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                    : 'text-[#A8C6C3] hover:text-white'
                }`}
              >
                Liquid
              </button>
              <button
                onClick={() => setSelectedTargetFilter('net_flow_overnight')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  selectedTargetFilter === 'net_flow_overnight'
                    ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                    : 'text-[#A8C6C3] hover:text-white'
                }`}
              >
                Overnight
              </button>
            </div>

            {/* March Scenario Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-[#071216] border border-[#F2C66D]/30 px-3 py-1.5 rounded-lg text-xs font-mono-code text-[#F2C66D] hover:border-[#F2C66D] transition-colors">
              <input
                type="checkbox"
                checked={includeMarchScenario}
                onChange={(e) => setIncludeMarchScenario(e.target.checked)}
                className="accent-[#00D4C3] cursor-pointer"
              />
              <span>Include Mar 2027 Scenario</span>
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code border-collapse" aria-label="Cash Buffer Recommendations Table">
            <thead>
              <tr className="border-b border-[#1D5555] text-[#A8C6C3] text-[11px]">
                <th className="py-2.5 px-3 font-semibold">MONTH</th>
                <th className="py-2.5 px-3 font-semibold">CATEGORY</th>
                <th className="py-2.5 px-3 font-semibold">HORIZON</th>
                <th className="py-2.5 px-3 font-semibold">MODEL</th>
                <th className="py-2.5 px-3 font-semibold text-right">POINT FLOW</th>
                <th className="py-2.5 px-3 font-semibold text-right">LOWER 5% BOUND</th>
                <th className="py-2.5 px-3 font-semibold text-right">REC. CASH BUFFER</th>
                <th className="py-2.5 px-3 font-semibold">DECISION RATIONALE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D5555]/50 text-xs">
              {recs.map((r, i) => {
                const polarity = getFlowPolarity(r.point_net_flow);
                const isMarch = r.forecast_month === '2027-03';
                const isBufferZero = r.p95_potential_outflow_buffer === 0;

                return (
                  <tr
                    key={i}
                    className={`hover:bg-[#103238]/60 transition-colors ${
                      isMarch ? 'bg-[#F2C66D]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-[#F2FBF9] whitespace-nowrap">
                      {formatMonthName(r.forecast_month)} ({r.forecast_month})
                      {isMarch && (
                        <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-[#F2C66D]/20 text-[#F2C66D] border border-[#F2C66D]/40">
                          SCENARIO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded ${
                          r.target === 'net_flow_liquid'
                            ? 'bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30'
                            : 'bg-[#103238] text-[#A9F2E7] border border-[#1D5555]'
                        }`}
                      >
                        {r.target === 'net_flow_liquid' ? 'Liquid Fund' : 'Overnight Fund'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#A8C6C3]">h = {r.horizon}m</td>
                    <td className="py-3 px-3 text-[#F2FBF9]">{r.selected_model}</td>
                    <td className={`py-3 px-3 text-right font-sans font-bold whitespace-nowrap tabular-nums ${polarity.colorClass}`}>
                      {formatCrore(r.point_net_flow, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-[#A8C6C3] font-sans font-medium whitespace-nowrap tabular-nums">
                      {formatCrore(r.one_sided_lower05_net_flow, true)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded font-sans font-bold text-sm whitespace-nowrap tabular-nums ${
                          isBufferZero
                            ? 'bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30'
                            : 'bg-[#F2C66D]/15 text-[#F2C66D] border border-[#F2C66D]/40'
                        }`}
                      >
                        {formatCrore(r.p95_potential_outflow_buffer, false, 0)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#A8C6C3] text-[11px] max-w-xs truncate">
                      {isBufferZero
                        ? 'Lower 5% bound is positive (+₹24.0k cr); no run buffer required'
                        : `Protects against ₹${Math.abs(r.one_sided_lower05_net_flow).toFixed(0)} cr worst-case 5th %ile outflow`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Policy Comparison (Model vs. Prior-Year Same-Month Baseline) */}
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1D5555]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
                Historical Policy Performance: Modeled Buffer vs. Prior-Year Baseline
              </h3>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30">
                24-Month Backtest
              </span>
            </div>
            <p className="text-xs text-[#A8C6C3] mt-0.5">
              Evaluated on the last 24 target releases (Oct 2024 – Sep 2026). Total Decision Cost = Idle Cash Yield Drag + 3x Shortfall Penalty.
            </p>
          </div>

          <div className="text-xs font-mono-code text-[#F2FBF9] bg-[#071216] px-3 py-1.5 rounded border border-[#1D5555]">
            Shortfall Multiplier: <strong className="text-[#F2C66D]">3.0x</strong> (PS 03 Spec)
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code border-collapse" aria-label="Policy Backtest Table">
            <thead>
              <tr className="border-b border-[#1D5555] text-[#A8C6C3] text-[11px]">
                <th className="py-2.5 px-3 font-semibold">CATEGORY</th>
                <th className="py-2.5 px-3 font-semibold">HORIZON</th>
                <th className="py-2.5 px-3 font-semibold">POLICY</th>
                <th className="py-2.5 px-3 font-semibold text-right">MEAN BUFFER</th>
                <th className="py-2.5 px-3 font-semibold text-right">MEAN EXCESS CASH</th>
                <th className="py-2.5 px-3 font-semibold text-right">MEAN YIELD DRAG</th>
                <th className="py-2.5 px-3 font-semibold text-right">MEAN SHORTFALL</th>
                <th className="py-2.5 px-3 font-semibold text-right">TOTAL DECISION COST</th>
                <th className="py-2.5 px-3 font-semibold text-right">COST ADVANTAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D5555]/50 text-xs">
              {BUFFER_POLICY_COMPARISON.map((row, i) => {
                const isModel = row.policy === 'forecast_p95_buffer';
                const isLiquid = row.target === 'net_flow_liquid';

                // Find baseline cost to compute savings
                const baselineRow = BUFFER_POLICY_COMPARISON.find(
                  (b) => b.target === row.target && b.horizon === row.horizon && b.policy === 'last_year_same_month_outflow'
                );
                const costDiff = baselineRow ? baselineRow.total_decision_cost - row.total_decision_cost : 0;
                const costReductionPct = baselineRow ? (costDiff / baselineRow.total_decision_cost) * 100 : 0;

                return (
                  <tr
                    key={i}
                    className={`hover:bg-[#103238]/60 transition-colors ${
                      isModel ? 'bg-[#00D4C3]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-[#F2FBF9] whitespace-nowrap">
                      {isLiquid ? 'Liquid Fund' : 'Overnight Fund'}
                    </td>
                    <td className="py-3 px-3 text-[#A8C6C3]">h = {row.horizon}m</td>
                    <td className="py-3 px-3 font-semibold whitespace-nowrap">
                      {isModel ? (
                        <span className="text-[#48F0DE] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00D4C3]" />
                          FlowGuard P95 Model
                        </span>
                      ) : (
                        <span className="text-[#A8C6C3]">Prior-Year Same-Month Baseline</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-sans font-medium tabular-nums whitespace-nowrap text-[#F2FBF9]">{formatCrore(row.mean_buffer, false, 0)}</td>
                    <td className="py-3 px-3 text-right font-sans font-medium tabular-nums whitespace-nowrap text-[#A8C6C3]">{formatCrore(row.mean_excess_cash, false, 0)}</td>
                    <td className="py-3 px-3 text-right font-sans font-medium tabular-nums whitespace-nowrap text-[#A8C6C3]">{formatCrore(row.mean_yield_drag, false, 2)}</td>
                    <td className={`py-3 px-3 text-right font-sans font-bold tabular-nums whitespace-nowrap ${row.mean_shortfall > 0 ? 'text-[#FF7B72]' : 'text-[#A9F2E7]'}`}>
                      {formatCrore(row.mean_shortfall, false, 1)}
                    </td>
                    <td className={`py-3 px-3 text-right font-sans font-bold text-sm tabular-nums whitespace-nowrap ${isModel ? 'text-[#48F0DE]' : 'text-[#FF7B72]'}`}>
                      {formatCrore(row.total_decision_cost, false, 0)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isModel ? (
                        <span className="text-[#00D4C3] font-bold text-[11px] bg-[#00D4C3]/15 px-2 py-0.5 rounded border border-[#00D4C3]/30">
                          +{costReductionPct.toFixed(1)}% savings
                        </span>
                      ) : (
                        <span className="text-[#A8C6C3] text-[11px]">Baseline benchmark</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Key Takeaway Card */}
        <div className="bg-[#071216] border border-[#00D4C3]/30 rounded-lg p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#48F0DE] font-semibold font-mono-code">
            <CheckCircle2 className="w-4 h-4 text-[#00D4C3]" />
            <span>Key Finding: Near-Zero Shortfall Eliminates Massive Penalty Costs</span>
          </div>
          <p className="text-[#A8C6C3] leading-relaxed">
            In Liquid Funds across all 3 horizons (h=1, 2, 3), the FlowGuard model achieved <strong>zero shortfalls</strong> across all 24 evaluation months (Mean Shortfall = 0.0), resulting in total 24-month decision costs of just ₹5,840 – ₹18,141 cr (pure yield drag). Conversely, the prior-year same-month baseline experienced recurrent shortfall penalties exceeding <strong>₹428,000 cr</strong> due to unpredictable month-on-month volatility surges.
          </p>
        </div>
      </div>

      {/* Sensitivity Analysis (1x, 3x, 5x Multipliers) */}
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1D5555]">
          <div>
            <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
              Shortfall Penalty Sensitivity Analysis (1x, 3x, 5x)
            </h3>
            <p className="text-xs text-[#A8C6C3] mt-0.5">
              Assessing how decision costs vary under varying corporate treasury risk-tolerance levels
            </p>
          </div>

          {/* Multiplier Selector Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#071216] border border-[#1D5555] rounded-lg text-xs font-mono-code">
            <span className="text-[10px] text-[#A8C6C3] px-2">SHORTFALL PENALTY:</span>
            {[1, 3, 5].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMultiplier(m)}
                className={`px-3 py-1 rounded transition-colors cursor-pointer font-bold ${
                  selectedMultiplier === m
                    ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                    : 'text-[#A8C6C3] hover:text-white'
                }`}
              >
                {m}x Penalty
              </button>
            ))}
          </div>
        </div>

        {/* Sensitivity Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code border-collapse" aria-label="Buffer Cost Sensitivity Table">
            <thead>
              <tr className="border-b border-[#1D5555] text-[#A8C6C3] text-[11px]">
                <th className="py-2.5 px-3 font-semibold">CATEGORY</th>
                <th className="py-2.5 px-3 font-semibold">HORIZON</th>
                <th className="py-2.5 px-3 font-semibold">POLICY</th>
                <th className="py-2.5 px-3 font-semibold text-right">SHORTFALL PENALTY</th>
                <th className="py-2.5 px-3 font-semibold text-right">MEAN SHORTFALL</th>
                <th className="py-2.5 px-3 font-semibold text-right">MEAN YIELD DRAG</th>
                <th className="py-2.5 px-3 font-semibold text-right">TOTAL DECISION COST</th>
                <th className="py-2.5 px-3 font-semibold text-right">MEAN COST / MONTH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D5555]/50 text-xs">
              {filteredSensitivity.map((row, i) => {
                const isModel = row.policy === 'forecast_p95_buffer';
                const isLiquid = row.target === 'net_flow_liquid';

                return (
                  <tr
                    key={i}
                    className={`hover:bg-[#103238]/60 transition-colors ${
                      isModel ? 'bg-[#00D4C3]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-[#F2FBF9] whitespace-nowrap">
                      {isLiquid ? 'Liquid Fund' : 'Overnight Fund'}
                    </td>
                    <td className="py-3 px-3 text-[#A8C6C3]">h = {row.horizon}m</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={isModel ? 'text-[#48F0DE] font-semibold' : 'text-[#A8C6C3]'}>
                        {isModel ? 'FlowGuard P95 Buffer' : 'Prior-Year Baseline'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#F2C66D]">
                      {row.shortfall_to_holding_cost_ratio}x
                    </td>
                    <td className={`py-3 px-3 text-right font-sans font-medium tabular-nums whitespace-nowrap ${row.mean_shortfall > 0 ? 'text-[#FF7B72]' : 'text-[#A9F2E7]'}`}>
                      {formatCrore(row.mean_shortfall, false, 1)}
                    </td>
                    <td className="py-3 px-3 text-right text-[#A8C6C3] font-sans font-medium tabular-nums whitespace-nowrap">
                      {formatCrore(row.mean_yield_drag, false, 2)}
                    </td>
                    <td className={`py-3 px-3 text-right font-sans font-bold text-sm tabular-nums whitespace-nowrap ${isModel ? 'text-[#48F0DE]' : 'text-[#FF7B72]'}`}>
                      {formatCrore(row.total_decision_cost, false, 0)}
                    </td>
                    <td className="py-3 px-3 text-right text-[#F2FBF9] font-sans font-medium tabular-nums whitespace-nowrap">
                      {formatCrore(row.mean_decision_cost, false, 1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
