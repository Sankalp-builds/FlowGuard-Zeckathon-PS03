import React, { useState, useMemo } from 'react';
import { MONTHLY_DATASET, NEXT_3_MONTH_FORECASTS, MARCH_15_SCENARIO } from '../data/flowguardData.ts';
import { formatCrore, formatMonthName } from '../utils/formatters.ts';

interface TimeSeriesChartProps {
  target: 'net_flow_liquid' | 'net_flow_overnight';
  showMarchScenario?: boolean;
  timeRange?: 'all' | '24m' | '12m';
}

interface DataPoint {
  month: string;
  isForecast: boolean;
  actualFlow?: number;
  mobilized?: number;
  redemptions?: number;
  pointForecast?: number;
  lower80?: number;
  upper80?: number;
  lower95?: number;
  upper95?: number;
  selectedModel?: string;
  isScenario?: boolean;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  target,
  showMarchScenario = false,
  timeRange = '24m',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [selectedRange, setSelectedRange] = useState<'all' | '24m' | '12m'>(timeRange);

  const categoryLabel = target === 'net_flow_liquid' ? 'Liquid Funds' : 'Overnight Funds';

  // Build combined series of historical + forecast points
  const chartData = useMemo(() => {
    let histRows = [...MONTHLY_DATASET];

    if (selectedRange === '12m') {
      histRows = histRows.slice(-12);
    } else if (selectedRange === '24m') {
      histRows = histRows.slice(-24); // 24-month evaluation window
    }

    const points: DataPoint[] = histRows.map((r) => ({
      month: r.month,
      isForecast: false,
      actualFlow: target === 'net_flow_liquid' ? r.net_flow_liquid : r.net_flow_overnight,
      mobilized: target === 'net_flow_liquid' ? r.mobilized_liquid : r.mobilized_overnight,
      redemptions: target === 'net_flow_liquid' ? r.redemptions_liquid : r.redemptions_overnight,
    }));

    // Add next 3 month forecasts
    const forecasts = NEXT_3_MONTH_FORECASTS.filter((f) => f.target === target).sort(
      (a, b) => a.horizon - b.horizon
    );

    forecasts.forEach((f) => {
      points.push({
        month: f.forecast_month,
        isForecast: true,
        pointForecast: f.point_forecast,
        lower80: f.lower80,
        upper80: f.upper80,
        lower95: f.lower95,
        upper95: f.upper95,
        selectedModel: f.selected_model,
      });
    });

    // Optional March 2027 scenario
    if (showMarchScenario) {
      const scenario = MARCH_15_SCENARIO.find((s) => s.target === target);
      if (scenario) {
        points.push({
          month: scenario.forecast_month,
          isForecast: true,
          isScenario: true,
          pointForecast: scenario.point_forecast,
          lower80: scenario.lower80,
          upper80: scenario.upper80,
          lower95: scenario.lower95,
          upper95: scenario.upper95,
          selectedModel: scenario.selected_model,
        });
      }
    }

    return points;
  }, [target, selectedRange, showMarchScenario]);

  // Dimensions & Scale calculation
  const padding = { top: 30, right: 35, bottom: 45, left: 75 };
  const width = 880;
  const height = 340;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minVal = useMemo(() => {
    let min = 0;
    chartData.forEach((d) => {
      if (d.actualFlow !== undefined) min = Math.min(min, d.actualFlow);
      if (d.lower95 !== undefined) min = Math.min(min, d.lower95);
      if (d.pointForecast !== undefined) min = Math.min(min, d.pointForecast);
    });
    // Add 10% breathing room
    return Math.floor(min * 1.12);
  }, [chartData]);

  const maxVal = useMemo(() => {
    let max = 0;
    chartData.forEach((d) => {
      if (d.actualFlow !== undefined) max = Math.max(max, d.actualFlow);
      if (d.upper95 !== undefined) max = Math.max(max, d.upper95);
      if (d.pointForecast !== undefined) max = Math.max(max, d.pointForecast);
    });
    return Math.ceil(max * 1.12);
  }, [chartData]);

  const getY = (val: number) => {
    const range = maxVal - minVal;
    if (range === 0) return innerHeight / 2;
    return padding.top + innerHeight - ((val - minVal) / range) * innerHeight;
  };

  const getX = (index: number) => {
    if (chartData.length <= 1) return padding.left;
    return padding.left + (index / (chartData.length - 1)) * innerWidth;
  };

  const zeroY = getY(0);

  // Generate SVG paths
  const historicalPoints = chartData
    .map((d, i) => (d.actualFlow !== undefined ? { x: getX(i), y: getY(d.actualFlow), d, i } : null))
    .filter(Boolean) as { x: number; y: number; d: DataPoint; i: number }[];

  const historicalLinePath = historicalPoints.length > 0
    ? historicalPoints.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '')
    : '';

  // Forecast points with continuity from last actual point
  const lastActual = historicalPoints[historicalPoints.length - 1];
  const forecastItems = chartData
    .map((d, i) => (d.isForecast && d.pointForecast !== undefined ? { x: getX(i), y: getY(d.pointForecast), d, i } : null))
    .filter(Boolean) as { x: number; y: number; d: DataPoint; i: number }[];

  const forecastLinePoints = lastActual ? [{ x: lastActual.x, y: lastActual.y }, ...forecastItems] : forecastItems;
  const forecastLinePath = forecastLinePoints.length > 0
    ? forecastLinePoints.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '')
    : '';

  // 95% Confidence Band Polygon
  const band95PointsTop = forecastItems.map((p) => `${p.x.toFixed(1)},${getY(p.d.upper95!).toFixed(1)}`);
  const band95PointsBottom = [...forecastItems].reverse().map((p) => `${p.x.toFixed(1)},${getY(p.d.lower95!).toFixed(1)}`);
  const band95Path = forecastItems.length > 0
    ? `M ${band95PointsTop.join(' L ')} L ${band95PointsBottom.join(' L ')} Z`
    : '';

  // 80% Confidence Band Polygon
  const band80PointsTop = forecastItems.map((p) => `${p.x.toFixed(1)},${getY(p.d.upper80!).toFixed(1)}`);
  const band80PointsBottom = [...forecastItems].reverse().map((p) => `${p.x.toFixed(1)},${getY(p.d.lower80!).toFixed(1)}`);
  const band80Path = forecastItems.length > 0
    ? `M ${band80PointsTop.join(' L ')} L ${band80PointsBottom.join(' L ')} Z`
    : '';

  // Horizontal Grid Lines
  const gridTicks = 6;
  const yTicks = Array.from({ length: gridTicks }).map((_, idx) => {
    const val = minVal + (idx / (gridTicks - 1)) * (maxVal - minVal);
    return { val, y: getY(val) };
  });

  return (
    <div className="bg-[#0B2023] border border-[#1D5555] rounded-xl p-5 shadow-lg relative flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1D5555]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D4C3] animate-pulse" />
            <h3 className="text-base font-bold text-[#F2FBF9] font-heading">
              {categoryLabel}: Monthly Net Flows & Prediction Bands
            </h3>
          </div>
          <p className="text-xs text-[#A8C6C3] mt-0.5">
            Historical observed net flows (solid) vs. 3-month rolling-origin point forecasts & uncertainty intervals (₹ crore)
          </p>
        </div>

        {/* Viewport Range Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#071216] border border-[#1D5555] rounded-lg text-xs font-mono-code">
          <button
            onClick={() => setSelectedRange('12m')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              selectedRange === '12m'
                ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                : 'text-[#A8C6C3] hover:text-[#F2FBF9]'
            }`}
          >
            Last 12M
          </button>
          <button
            onClick={() => setSelectedRange('24m')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              selectedRange === '24m'
                ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                : 'text-[#A8C6C3] hover:text-[#F2FBF9]'
            }`}
          >
            24M Eval
          </button>
          <button
            onClick={() => setSelectedRange('all')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              selectedRange === 'all'
                ? 'bg-[#103238] text-[#48F0DE] border border-[#00D4C3]/40'
                : 'text-[#A8C6C3] hover:text-[#F2FBF9]'
            }`}
          >
            All 69M
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative w-full overflow-x-auto pt-2 pb-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
          style={{ minWidth: '600px' }}
        >
          <defs>
            {/* Subtle retro linear gradient */}
            <linearGradient id="band80Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D4C3" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#00D4C3" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="band95Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#48F0DE" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#48F0DE" stopOpacity="0.05" />
            </linearGradient>
            <pattern id="pixelGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1D5555" strokeWidth="0.5" strokeOpacity="0.35" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect x={padding.left} y={padding.top} width={innerWidth} height={innerHeight} fill="url(#pixelGrid)" />

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#1D5555"
                strokeWidth="1"
                strokeDasharray="3 3"
                strokeOpacity="0.6"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 3.5}
                textAnchor="end"
                className="fill-[#A8C6C3] text-[10px] font-sans font-medium tabular-nums"
              >
                {formatCrore(tick.val, true, 0)}
              </text>
            </g>
          ))}

          {/* Zero Reference Line */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke="#A8C6C3"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeOpacity="0.9"
          />
          <text
            x={width - padding.right + 6}
            y={zeroY + 3}
            textAnchor="start"
            className="fill-[#A8C6C3] text-[9px] font-mono-code"
          >
            Zero Flow
          </text>

          {/* 95% Uncertainty Band */}
          {band95Path && (
            <path
              d={band95Path}
              fill="url(#band95Grad)"
              stroke="#48F0DE"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              strokeOpacity="0.5"
            />
          )}

          {/* 80% Uncertainty Band */}
          {band80Path && (
            <path
              d={band80Path}
              fill="url(#band80Grad)"
              stroke="#00D4C3"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
          )}

          {/* Historical Observed Flow Line */}
          {historicalLinePath && (
            <path
              d={historicalLinePath}
              fill="none"
              stroke="#00D4C3"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Forecast Point Estimate Line (Dashed) */}
          {forecastLinePath && (
            <path
              d={forecastLinePath}
              fill="none"
              stroke="#48F0DE"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
          )}

          {/* Historical Data Dots */}
          {historicalPoints.map((p, idx) => {
            const isNegative = (p.d.actualFlow || 0) < 0;
            return (
              <circle
                key={`hist-${idx}`}
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.month === p.d.month ? 5.5 : 3}
                fill={isNegative ? '#FF7B72' : '#00D4C3'}
                stroke="#071216"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p.d)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Forecast Points (Diamonds) */}
          {forecastItems.map((p, idx) => {
            const isNegative = (p.d.pointForecast || 0) < 0;
            return (
              <g
                key={`fc-${idx}`}
                transform={`translate(${p.x}, ${p.y}) rotate(45)`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p.d)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <rect
                  x="-4"
                  y="-4"
                  width="8"
                  height="8"
                  fill={isNegative ? '#FF7B72' : '#48F0DE'}
                  stroke="#071216"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* X-Axis Month Labels (Sampled for legibility) */}
          {chartData.map((d, i) => {
            const isLast = i === chartData.length - 1;
            const isFirst = i === 0;
            const isQuarterly = (i + 1) % (selectedRange === 'all' ? 6 : 3) === 0;
            const isForecast = d.isForecast;

            if (isFirst || isQuarterly || isLast || isForecast) {
              const x = getX(i);
              return (
                <g key={`x-lbl-${i}`} transform={`translate(${x}, ${height - padding.bottom + 18})`}>
                  <text
                    textAnchor="middle"
                    className={`text-[9.5px] font-mono-code ${
                      isForecast
                        ? d.isScenario
                          ? 'fill-[#F2C66D] font-bold'
                          : 'fill-[#48F0DE] font-bold'
                        : 'fill-[#A8C6C3]'
                    }`}
                  >
                    {d.month}
                  </text>
                  {isForecast && (
                    <text
                      y="12"
                      textAnchor="middle"
                      className="fill-[#A8C6C3] text-[8px] font-mono-code uppercase"
                    >
                      {d.isScenario ? 'SCENARIO' : 'FCST'}
                    </text>
                  )}
                </g>
              );
            }
            return null;
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-[#103238] border border-[#00D4C3]/50 rounded-lg p-3 shadow-xl text-xs z-10 font-mono-code max-w-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2 border-b border-[#1D5555] pb-1.5 mb-2">
              <span className="font-bold text-[#F2FBF9]">
                {formatMonthName(hoveredPoint.month)} ({hoveredPoint.month})
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  hoveredPoint.isForecast
                    ? hoveredPoint.isScenario
                      ? 'bg-[#F2C66D]/20 text-[#F2C66D] border border-[#F2C66D]/40'
                      : 'bg-[#00D4C3]/20 text-[#48F0DE] border border-[#00D4C3]/40'
                    : 'bg-[#071216] text-[#A8C6C3] border border-[#1D5555]'
                }`}
              >
                {hoveredPoint.isForecast
                  ? hoveredPoint.isScenario
                    ? '6M Advance-Tax Scenario'
                    : 'Point Forecast'
                  : 'Observed AMFI'}
              </span>
            </div>

            {hoveredPoint.isForecast ? (
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#A8C6C3]">Model:</span>
                  <span className="text-[#F2FBF9] font-medium">{hoveredPoint.selectedModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A8C6C3]">Point Forecast:</span>
                  <span
                    className={`font-bold ${
                      (hoveredPoint.pointForecast || 0) < 0 ? 'text-[#FF7B72]' : 'text-[#A9F2E7]'
                    }`}
                  >
                    {formatCrore(hoveredPoint.pointForecast, true)}
                  </span>
                </div>
                <div className="border-t border-[#1D5555] pt-1.5 space-y-1 text-[10px]">
                  <div className="flex justify-between text-[#48F0DE]">
                    <span>80% Interval:</span>
                    <span>
                      [{formatCrore(hoveredPoint.lower80, true, 0)} to {formatCrore(hoveredPoint.upper80, true, 0)}]
                    </span>
                  </div>
                  <div className="flex justify-between text-[#A8C6C3]">
                    <span>95% Interval:</span>
                    <span>
                      [{formatCrore(hoveredPoint.lower95, true, 0)} to {formatCrore(hoveredPoint.upper95, true, 0)}]
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#A8C6C3]">Net Flow:</span>
                  <span
                    className={`font-bold ${
                      (hoveredPoint.actualFlow || 0) < 0 ? 'text-[#FF7B72]' : 'text-[#A9F2E7]'
                    }`}
                  >
                    {formatCrore(hoveredPoint.actualFlow, true)}
                  </span>
                </div>
                {hoveredPoint.mobilized !== undefined && (
                  <div className="flex justify-between text-[10px] text-[#A8C6C3]">
                    <span>Mobilized:</span>
                    <span>{formatCrore(hoveredPoint.mobilized)}</span>
                  </div>
                )}
                {hoveredPoint.redemptions !== undefined && (
                  <div className="flex justify-between text-[10px] text-[#A8C6C3]">
                    <span>Redemptions:</span>
                    <span>{formatCrore(hoveredPoint.redemptions)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend & Explanatory Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 mt-1 border-t border-[#1D5555] text-xs text-[#A8C6C3]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D4C3]" />
            <span className="text-[#F2FBF9] text-[11px]">Observed Net Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-[#48F0DE]" />
            <span className="text-[#F2FBF9] text-[11px]">Point Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-[#00D4C3]/30 border border-[#00D4C3]/70 rounded-[1px]" />
            <span className="text-[#A8C6C3] text-[11px]">80% Prediction Band</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-[#48F0DE]/15 border border-[#48F0DE]/40 rounded-[1px]" />
            <span className="text-[#A8C6C3] text-[11px]">95% Prediction Band</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7B72]" />
            <span className="text-[#FF7B72] text-[11px]">Outflow Polarity</span>
          </div>
        </div>

        <div className="text-[11px] font-mono-code text-[#A8C6C3]">
          All units in <strong className="text-[#F2FBF9]">₹ crore</strong> · Monthly aggregation only
        </div>
      </div>
    </div>
  );
};
