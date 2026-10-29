import React, { useState } from 'react';
import {
  NEXT_3_MONTH_FORECASTS,
  MARCH_15_SCENARIO,
  FORECAST_METADATA,
} from '../data/flowguardData.ts';
import { formatCrore, formatMonthName, getFlowPolarity } from '../utils/formatters.ts';
import { TimeSeriesChart } from './TimeSeriesChart.tsx';
import {
  HelpCircle,
  AlertCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Gauge,
  Sliders,
  CheckCircle,
} from 'lucide-react';

export const ForecastsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'net_flow_liquid' | 'net_flow_overnight'>('net_flow_liquid');
  const [selectedHorizon, setSelectedHorizon] = useState<number | 'all'>('all');
  const [includeMarchScenario, setIncludeMarchScenario] = useState<boolean>(false);

  // Filter forecasts based on category and horizon
  const allForecasts = [...NEXT_3_MONTH_FORECASTS];
  if (includeMarchScenario) {
    const marchRows = MARCH_15_SCENARIO.map((m) => ({
      ...m,
      isScenario: true,
    }));
    allForecasts.push(...(marchRows as any));
  }

  const filteredForecasts = allForecasts.filter((f) => {
    if (f.target !== selectedCategory) return false;
    if (selectedHorizon !== 'all' && f.horizon !== selectedHorizon) return false;
    return true;
  });

  const categoryName = selectedCategory === 'net_flow_liquid' ? 'Liquid Mutual Funds' : 'Overnight Mutual Funds';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono-code text-[#A8C6C3] uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Layers className="w-3.5 h-3.5 text-[#00D4C3]" />
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('net_flow_liquid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedCategory === 'net_flow_liquid'
                ? 'bg-[#00D4C3] text-[#071216] shadow-sm'
                : 'bg-[#071216] text-[#A8C6C3] border border-[#1D5555] hover:text-[#F2FBF9]'
            }`}
          >
            Liquid Funds
          </button>
          <button
            onClick={() => setSelectedCategory('net_flow_overnight')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedCategory === 'net_flow_overnight'
                ? 'bg-[#00D4C3] text-[#071216] shadow-sm'
                : 'bg-[#071216] text-[#A8C6C3] border border-[#1D5555] hover:text-[#F2FBF9]'
            }`}
          >
            Overnight Funds
          </button>
        </div>

        {/* Horizon Filter & March Scenario Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Horizon Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#071216] border border-[#1D5555] rounded-lg text-xs font-mono-code">
            <span className="text-[10px] text-[#A8C6C3] px-2">HORIZON:</span>
            {[
              { label: 'All Horizons', val: 'all' as const },
              { label: 'h = 1m', val: 1 },
              { label: 'h = 2m', val: 2 },
              { label: 'h = 3m', val: 3 },
              ...(includeMarchScenario ? [{ label: 'h = 6m (Mar)', val: 6 }] : []),
            ].map((item) => (
              <button
                key={String(item.val)}
                onClick={() => setSelectedHorizon(item.val as any)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  selectedHorizon === item.val
                    ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                    : 'text-[#A8C6C3] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Optional March 2027 Scenario Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-[#071216] border border-[#F2C66D]/30 px-3 py-1.5 rounded-lg text-xs font-mono-code text-[#F2C66D] hover:border-[#F2C66D] transition-colors">
            <input
              type="checkbox"
              checked={includeMarchScenario}
              onChange={(e) => setIncludeMarchScenario(e.target.checked)}
              className="accent-[#00D4C3] cursor-pointer"
            />
            <span>Include Mar 2027 (6M Scenario)</span>
          </label>
        </div>
      </div>

      {/* Uncertainty Chart */}
      <TimeSeriesChart
        target={selectedCategory}
        showMarchScenario={includeMarchScenario}
        timeRange="24m"
      />

      {/* Forecast Details Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
            {categoryName}: Detailed Horizon Forecasts & Uncertainty Bands
          </h3>
          <span className="text-xs font-mono-code text-[#A8C6C3]">
            Training through: <strong>{FORECAST_METADATA.data_as_of_month}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForecasts.map((fc, idx) => {
            const isScenario = (fc as any).isScenario || fc.horizon === 6;
            const polarity = getFlowPolarity(fc.point_forecast);
            const interval80Width = fc.upper80 - fc.lower80;
            const interval95Width = fc.upper95 - fc.lower95;

            return (
              <div
                key={idx}
                className={`bg-[#0B2023] border rounded-xl p-5 shadow-md flex flex-col justify-between transition-all ${
                  isScenario
                    ? 'border-[#F2C66D]/40 bg-[#0B2023]/90'
                    : 'border-[#1D5555] hover:border-[#00D4C3]/40'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#1D5555]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-[#F2FBF9] font-mono-code">
                          {formatMonthName(fc.forecast_month)}
                        </span>
                        <span className="text-xs font-mono-code text-[#A8C6C3]">
                          ({fc.forecast_month})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#A8C6C3] font-mono-code mt-0.5">
                        Horizon: h = {fc.horizon} month{fc.horizon > 1 ? 's' : ''}
                      </div>
                    </div>
                    {isScenario ? (
                      <span className="px-2 py-0.5 rounded bg-[#F2C66D]/15 text-[#F2C66D] border border-[#F2C66D]/30 text-[10px] font-mono-code uppercase font-semibold">
                        Advance-Tax Scenario
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30 text-[10px] font-mono-code uppercase font-semibold">
                        Release h={fc.horizon}
                      </span>
                    )}
                  </div>

                  {/* Point Forecast Display */}
                  <div className="py-4">
                    <div className="text-[11px] text-[#A8C6C3] uppercase font-mono-code mb-1">
                      Point Net Flow Forecast
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-extrabold font-sans tabular-nums whitespace-nowrap ${polarity.colorClass}`}>
                        {formatCrore(fc.point_forecast, true)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-mono-code ${polarity.badgeBg}`}>
                        {polarity.label}
                      </span>
                    </div>
                  </div>

                  {/* Prediction Intervals Grid */}
                  <div className="space-y-2.5 pt-2 border-t border-[#1D5555]">
                    {/* 80% Prediction Interval */}
                    <div className="bg-[#071216] p-2.5 rounded-lg border border-[#00D4C3]/30">
                      <div className="flex items-center justify-between text-[11px] text-[#48F0DE] font-mono-code mb-1">
                        <span className="font-semibold">80% Prediction Interval</span>
                        <span className="text-[10px] text-[#A8C6C3] font-sans tabular-nums">Width: {formatCrore(interval80Width, false, 0)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono-code">
                        <span className="text-[#A8C6C3]">Lower 10%: <strong className="text-[#F2FBF9] font-sans tabular-nums">{formatCrore(fc.lower80, true, 0)}</strong></span>
                        <span className="text-[#A8C6C3]">Upper 90%: <strong className="text-[#F2FBF9] font-sans tabular-nums">{formatCrore(fc.upper80, true, 0)}</strong></span>
                      </div>
                    </div>

                    {/* 95% Prediction Interval */}
                    <div className="bg-[#071216] p-2.5 rounded-lg border border-[#1D5555]">
                      <div className="flex items-center justify-between text-[11px] text-[#A8C6C3] font-mono-code mb-1">
                        <span className="font-semibold">95% Prediction Interval</span>
                        <span className="text-[10px] text-[#A8C6C3] font-sans tabular-nums">Width: {formatCrore(interval95Width, false, 0)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono-code">
                        <span className="text-[#A8C6C3]">Lower 2.5%: <strong className="text-[#F2FBF9] font-sans tabular-nums">{formatCrore(fc.lower95, true, 0)}</strong></span>
                        <span className="text-[#A8C6C3]">Upper 97.5%: <strong className="text-[#F2FBF9] font-sans tabular-nums">{formatCrore(fc.upper95, true, 0)}</strong></span>
                      </div>
                    </div>

                    {/* One-Sided Lower 5% Bound (Buffer Driver) */}
                    <div className="bg-[#103238]/60 p-2.5 rounded-lg border border-[#F2C66D]/30 flex items-center justify-between text-xs font-mono-code">
                      <div>
                        <div className="text-[10px] text-[#F2C66D] font-semibold uppercase">One-Sided Lower 5% Bound</div>
                        <div className="text-[10px] text-[#A8C6C3]">Defines P95 potential outflow buffer</div>
                      </div>
                      <span className={`text-sm font-bold font-sans tabular-nums whitespace-nowrap ${fc.lower05 < 0 ? 'text-[#FF7B72]' : 'text-[#A9F2E7]'}`}>
                        {formatCrore(fc.lower05, true, 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Model Selection */}
                <div className="pt-3 mt-4 border-t border-[#1D5555] flex items-center justify-between text-[11px] font-mono-code text-[#A8C6C3]">
                  <span>Model: <strong className="text-[#F2FBF9]">{fc.selected_model}</strong></span>
                  <span className="text-[10px]">Method: Empirical Quantiles</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uncertainty & Tail Sample Limitation Notice */}
      <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-4 text-xs text-[#A8C6C3] space-y-2">
        <div className="flex items-center gap-2 text-[#48F0DE] font-semibold font-mono-code">
          <HelpCircle className="w-4 h-4 text-[#00D4C3]" />
          <span>Understanding Empirical Quantile Prediction Intervals & Tail Sample Uncertainty</span>
        </div>
        <p className="leading-relaxed">
          Prediction intervals are not assumed to follow a parametric Gaussian distribution. Instead, FlowGuard computes empirical quantiles from out-of-fold forecast residuals generated across prior rolling origins.
        </p>
        <div className="bg-[#071216] p-3 rounded border border-[#1D5555] leading-relaxed text-[#F2FBF9]">
          <strong className="text-[#F2C66D]">Sample Size Caveat:</strong> With only 69 monthly observations in the historical series and 24 rolling-origin evaluation folds, tail quantiles (such as the 2.5%, 5%, 95%, and 97.5% empirical bounds) are statistically uncertain and sensitive to individual extreme redemption shock months.
        </div>
      </div>
    </div>
  );
};
