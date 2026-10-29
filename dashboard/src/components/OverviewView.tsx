import React, { useState } from 'react';
import {
  FORECAST_METADATA,
  NEXT_3_MONTH_FORECASTS,
  CASH_BUFFER_RECOMMENDATIONS,
  MONTHLY_DATASET,
} from '../data/flowguardData.ts';
import { formatCrore, formatMonthName, getFlowPolarity } from '../utils/formatters.ts';
import { TimeSeriesChart } from './TimeSeriesChart.tsx';
import { CaveatBanner } from './CaveatBanner.tsx';
import {
  Calendar,
  Layers,
  Activity,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface OverviewViewProps {
  onOpenAuditModal: () => void;
  onNavigateToForecasts: () => void;
  onNavigateToCashBuffer: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenAuditModal,
  onNavigateToForecasts,
  onNavigateToCashBuffer,
}) => {
  const [activeCategory, setActiveCategory] = useState<'net_flow_liquid' | 'net_flow_overnight'>('net_flow_liquid');

  // Filter forecasts
  const liquidForecasts = NEXT_3_MONTH_FORECASTS.filter((f) => f.target === 'net_flow_liquid');
  const overnightForecasts = NEXT_3_MONTH_FORECASTS.filter((f) => f.target === 'net_flow_overnight');

  // Calculate total recommended cash buffer for Q4 (Oct-Dec 2026) across both categories
  const totalRecommendedBuffer = CASH_BUFFER_RECOMMENDATIONS.reduce(
    (acc, curr) => acc + (curr.p95_potential_outflow_buffer || 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Advisory Banner */}
      <CaveatBanner onOpenDetails={onOpenAuditModal} />

      {/* KPI Headline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Data Through Month */}
        <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-4 shadow-sm hover:border-[#00D4C3]/50 transition-colors">
          <div className="flex items-center justify-between text-[#A8C6C3] text-xs font-mono-code mb-2">
            <span>DATA VINTAGE</span>
            <Calendar className="w-4 h-4 text-[#00D4C3]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F2FBF9] font-heading tracking-tight">
            {formatMonthName(FORECAST_METADATA.data_as_of_month)}
          </div>
          <div className="text-[11px] text-[#A8C6C3] mt-1 flex items-center gap-1.5 font-mono-code">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4C3]" />
            <span>As of {FORECAST_METADATA.data_as_of_month} (69th month)</span>
          </div>
        </div>

        {/* KPI 2: Total Observations */}
        <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-4 shadow-sm hover:border-[#00D4C3]/50 transition-colors">
          <div className="flex items-center justify-between text-[#A8C6C3] text-xs font-mono-code mb-2">
            <span>PANEL COVERAGE</span>
            <Layers className="w-4 h-4 text-[#48F0DE]" />
          </div>
          <div className="text-2xl font-extrabold text-[#48F0DE] font-heading tracking-tight tabular-nums">
            {MONTHLY_DATASET.length} Months
          </div>
          <div className="text-[11px] text-[#A8C6C3] mt-1 font-mono-code">
            Jan 2021 – Sep 2026 (AMFI Rebuilt)
          </div>
        </div>

        {/* KPI 3: Evaluation Window */}
        <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-4 shadow-sm hover:border-[#00D4C3]/50 transition-colors">
          <div className="flex items-center justify-between text-[#A8C6C3] text-xs font-mono-code mb-2">
            <span>EVALUATION WINDOW</span>
            <Activity className="w-4 h-4 text-[#00D4C3]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F2FBF9] font-heading tracking-tight">
            Last 24 Releases
          </div>
          <div className="text-[11px] text-[#A8C6C3] mt-1 font-mono-code">
            Rolling-origin validation (Oct 2024 – Sep 2026)
          </div>
        </div>

        {/* KPI 4: Total Q4 Recommended Outflow Buffer */}
        <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-4 shadow-sm hover:border-[#F2C66D]/50 transition-colors">
          <div className="flex items-center justify-between text-[#A8C6C3] text-xs font-mono-code mb-2">
            <span>Q4 REC. BUFFER</span>
            <ShieldCheck className="w-4 h-4 text-[#F2C66D]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F2C66D] font-sans font-bold tabular-nums whitespace-nowrap">
            {formatCrore(totalRecommendedBuffer, false, 0)}
          </div>
          <div className="text-[11px] text-[#A8C6C3] mt-1 font-mono-code">
            95th percentile potential outflow reserve
          </div>
        </div>
      </div>

      {/* Prominent Next 3-Month Forecast Table */}
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1D5555]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
                Next Three Months Forecast Releases (Q4 2026)
              </h3>
              <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30">
                Primary Release
              </span>
            </div>
            <p className="text-xs text-[#A8C6C3] mt-0.5">
              Point net flow forecast with calibrated 80% & 95% empirical prediction interval bounds (₹ crore)
            </p>
          </div>

          <button
            onClick={onNavigateToForecasts}
            className="text-xs font-mono-code text-[#48F0DE] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>Deep Dive in Forecasts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Forecast Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono-code border-collapse" aria-label="3-Month Forecast Table">
            <thead>
              <tr className="border-b border-[#1D5555] text-[#A8C6C3] text-[11px]">
                <th className="py-2.5 px-3 font-semibold">TARGET MONTH</th>
                <th className="py-2.5 px-3 font-semibold">CATEGORY</th>
                <th className="py-2.5 px-3 font-semibold">HORIZON</th>
                <th className="py-2.5 px-3 font-semibold">SELECTED MODEL</th>
                <th className="py-2.5 px-3 font-semibold text-right">POINT FORECAST</th>
                <th className="py-2.5 px-3 font-semibold text-right">80% INTERVAL</th>
                <th className="py-2.5 px-3 font-semibold text-right">95% INTERVAL</th>
                <th className="py-2.5 px-3 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D5555]/50 text-xs">
              {NEXT_3_MONTH_FORECASTS.map((row, idx) => {
                const polarity = getFlowPolarity(row.point_forecast);
                const isLiquid = row.target === 'net_flow_liquid';
                return (
                  <tr
                    key={idx}
                    className="hover:bg-[#103238]/60 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-[#F2FBF9] whitespace-nowrap">
                      {formatMonthName(row.forecast_month)} ({row.forecast_month})
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded ${
                          isLiquid
                            ? 'bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30'
                            : 'bg-[#103238] text-[#A9F2E7] border border-[#1D5555]'
                        }`}
                      >
                        {isLiquid ? 'Liquid Fund' : 'Overnight Fund'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#A8C6C3]">
                      h = {row.horizon}m
                    </td>
                    <td className="py-3 px-3 text-[#F2FBF9] font-medium">
                      {row.selected_model}
                    </td>
                    <td className={`py-3 px-3 text-right font-sans font-bold text-sm whitespace-nowrap tabular-nums ${polarity.colorClass}`}>
                      {formatCrore(row.point_forecast, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-[#48F0DE] text-xs font-sans font-medium tabular-nums whitespace-nowrap">
                      [{formatCrore(row.lower80, true, 0)} to {formatCrore(row.upper80, true, 0)}]
                    </td>
                    <td className="py-3 px-3 text-right text-[#A8C6C3] text-xs font-sans font-medium tabular-nums whitespace-nowrap">
                      [{formatCrore(row.lower95, true, 0)} to {formatCrore(row.upper95, true, 0)}]
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded ${polarity.badgeBg}`}>
                        {polarity.type === 'inflow' ? (
                          <ArrowUpRight className="w-3 h-3 text-[#00D4C3]" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-[#FF7B72]" />
                        )}
                        <span>{polarity.label}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Advance Tax Note */}
        <div className="mt-4 pt-3 border-t border-[#1D5555] flex items-start gap-2.5 text-xs text-[#A8C6C3] bg-[#071216]/60 p-3 rounded-lg">
          <Info className="w-4 h-4 text-[#00D4C3] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#F2FBF9]">Decision Context Note (Advance-Tax Due Dates):</strong> The massive historical outflows observed in March, June, September, and December align with quarterly advance corporate tax installments. FlowGuard models these as recurring monthly macro calendar events. March 15 decision context remains a <em>monthly estimate</em>, not a daily single-day forecast.
          </div>
        </div>
      </div>

      {/* Category Toggle & Time Series Visualization */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#F2FBF9] uppercase tracking-wider font-mono-code">
              Visual Liquidity Horizon
            </h3>
            <span className="text-xs text-[#A8C6C3]">· Switch series below</span>
          </div>

          {/* Category Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#0B2023] border border-[#1D5555] rounded-lg">
            <button
              onClick={() => setActiveCategory('net_flow_liquid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeCategory === 'net_flow_liquid'
                  ? 'bg-[#00D4C3] text-[#071216] shadow-sm'
                  : 'text-[#A8C6C3] hover:text-[#F2FBF9]'
              }`}
            >
              Liquid Funds (AMFI)
            </button>
            <button
              onClick={() => setActiveCategory('net_flow_overnight')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeCategory === 'net_flow_overnight'
                  ? 'bg-[#00D4C3] text-[#071216] shadow-sm'
                  : 'text-[#A8C6C3] hover:text-[#F2FBF9]'
              }`}
            >
              Overnight Funds (AMFI)
            </button>
          </div>
        </div>

        {/* TimeSeries Chart */}
        <TimeSeriesChart target={activeCategory} timeRange="24m" showMarchScenario={false} />
      </div>

      {/* Quick Summary Grid: Cash Buffer & Model Selection Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cash Buffer Quick Card */}
        <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#48F0DE] uppercase tracking-wider font-mono-code">
                Potential-Outflow Buffer Logic
              </span>
              <ShieldCheck className="w-4 h-4 text-[#00D4C3]" />
            </div>
            <p className="text-xs text-[#A8C6C3] leading-relaxed mb-3">
              To defend against liquidity run risk while minimizing idle-cash yield drag, FlowGuard recommends:
            </p>
            <div className="bg-[#071216] p-3 rounded border border-[#1D5555] font-mono-code text-xs text-[#F2FBF9] mb-3">
              Buffer = max(0, -Lower 5% Net Flow Forecast)
            </div>
            <p className="text-xs text-[#A8C6C3] leading-relaxed">
              If the 5th percentile tail predicts an inflow, buffer is ₹0 (no liquidity reserve required). If the tail is negative, buffer covers 95% of worst-case potential redemptions.
            </p>
          </div>
          <button
            onClick={onNavigateToCashBuffer}
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#103238] hover:bg-[#1D5555] text-[#48F0DE] border border-[#00D4C3]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Inspect Buffer Recommendations & 3x Cost Analysis</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Model Selection Quick Card */}
        <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#48F0DE] uppercase tracking-wider font-mono-code">
                Validation & Model Selection
              </span>
              <Activity className="w-4 h-4 text-[#00D4C3]" />
            </div>
            <p className="text-xs text-[#A8C6C3] leading-relaxed mb-3">
              Models are evaluated across expanding rolling origins on the last 24 target releases:
            </p>
            <ul className="text-xs space-y-1.5 text-[#A8C6C3] list-disc list-inside mb-3">
              <li><strong className="text-[#F2FBF9]">Liquid Funds (h=1,2,3):</strong> Seasonal Naive benchmark outperforms complex ML (MAE 33,198 vs 39,050–40,986 cr) due to sharp quarter-end seasonality.</li>
              <li><strong className="text-[#F2FBF9]">Overnight Funds (h=1,3):</strong> HistGradientBoosting regressor wins with lowest MAE (15,202 cr at h=1).</li>
              <li>Winner selection and reported metrics share the same 24 folds (validation estimates).</li>
            </ul>
          </div>
          <button
            onClick={onNavigateToForecasts}
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#103238] hover:bg-[#1D5555] text-[#48F0DE] border border-[#00D4C3]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Explore Rolling-Origin Metrics & Intervals</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
