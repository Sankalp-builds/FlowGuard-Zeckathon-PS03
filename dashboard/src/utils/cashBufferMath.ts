/**
 * Pure calculation logic for FlowGuard Potential-Outflow Buffer and Decision Costs
 * Rule: Recommended cash buffer is max(0, -lower 5% net-flow forecast)
 */

export interface CashBufferResult {
  recommendedBuffer: number;
  isBufferZero: boolean;
  lower05Bound: number;
}

/**
 * Calculates recommended potential-outflow buffer from the lower 5% bound of the net-flow forecast.
 * Negative lower 5% net-flow indicates potential outflow.
 */
export function calculateRecommendedBuffer(lower05Bound: number): CashBufferResult {
  // If lower 5% bound is positive (+₹24,071 cr), even in the 5th percentile worst-case
  // there is an inflow, so recommended buffer is 0.
  // If lower 5% bound is negative (-₹79,354 cr), the 95th percentile potential outflow is ₹79,354 cr.
  const recommendedBuffer = Math.max(0, -lower05Bound);
  return {
    recommendedBuffer,
    isBufferZero: recommendedBuffer === 0,
    lower05Bound,
  };
}

/**
 * Computes decision cost for a buffer policy given actual net flow and proxy yield.
 * Positive flow means inflow (outflow = 0). Negative flow means actual outflow = -actualNetFlow.
 */
export function calculateDecisionCost(params: {
  buffer: number;
  actualNetFlow: number;
  tbillYieldAnnualPct: number;
  horizonMonths: number;
  shortfallMultiplier?: number;
}): {
  actualOutflow: number;
  excessCash: number;
  yieldDrag: number;
  shortfall: number;
  shortfallCost: number;
  totalCost: number;
} {
  const {
    buffer,
    actualNetFlow,
    tbillYieldAnnualPct,
    horizonMonths,
    shortfallMultiplier = 3.0,
  } = params;

  const actualOutflow = Math.max(0, -actualNetFlow);
  const excessCash = Math.max(0, buffer - actualOutflow);
  const shortfall = Math.max(0, actualOutflow - buffer);

  // Yield drag prorated by horizon months: excessCash * (yield / 100) * (horizon / 12)
  const yieldDrag = excessCash * (tbillYieldAnnualPct / 100) * (horizonMonths / 12);
  const shortfallCost = shortfallMultiplier * shortfall;
  const totalCost = yieldDrag + shortfallCost;

  return {
    actualOutflow,
    excessCash,
    yieldDrag,
    shortfall,
    shortfallCost,
    totalCost,
  };
}
