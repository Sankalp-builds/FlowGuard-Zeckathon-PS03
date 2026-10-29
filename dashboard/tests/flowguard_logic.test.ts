import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRecommendedBuffer, calculateDecisionCost } from '../src/utils/cashBufferMath.ts';
import { formatCrore, getFlowPolarity } from '../src/utils/formatters.ts';

test('Cash buffer rule returns 0 when lower 5% bound is positive (net inflow even in tail)', () => {
  // e.g. Oct 2026 Liquid fund has lower05 = +24,071.49 cr
  const result = calculateRecommendedBuffer(24071.49);
  assert.equal(result.recommendedBuffer, 0);
  assert.equal(result.isBufferZero, true);
});

test('Cash buffer rule returns positive buffer when lower 5% bound is negative (potential outflow)', () => {
  // e.g. Nov 2026 Liquid fund has lower05 = -79,354.35 cr
  const result = calculateRecommendedBuffer(-79354.3465);
  assert.ok(Math.abs(result.recommendedBuffer - 79354.3465) < 0.001);
  assert.equal(result.isBufferZero, false);
});

test('Decision cost accurately calculates 3x shortfall penalty and yield drag', () => {
  // Buffer of 500 cr, actual outflow of 800 cr (shortfall = 300 cr)
  // Yield of 6% annualized, 1 month horizon
  const cost = calculateDecisionCost({
    buffer: 500,
    actualNetFlow: -800, // actual outflow = 800
    tbillYieldAnnualPct: 6.0,
    horizonMonths: 1,
    shortfallMultiplier: 3.0,
  });

  assert.equal(cost.actualOutflow, 800);
  assert.equal(cost.excessCash, 0);
  assert.equal(cost.yieldDrag, 0);
  assert.equal(cost.shortfall, 300);
  assert.equal(cost.shortfallCost, 900); // 3 * 300
  assert.equal(cost.totalCost, 900);
});

test('Decision cost calculates yield drag when excess cash is held', () => {
  // Buffer of 1000 cr, actual outflow of 400 cr (excess cash = 600 cr)
  // Yield of 6% annualized, 2 months horizon
  const cost = calculateDecisionCost({
    buffer: 1000,
    actualNetFlow: -400,
    tbillYieldAnnualPct: 6.0,
    horizonMonths: 2,
    shortfallMultiplier: 3.0,
  });

  assert.equal(cost.excessCash, 600);
  assert.equal(cost.shortfall, 0);
  // yieldDrag = 600 * 0.06 * (2/12) = 600 * 0.01 = 6
  assert.ok(Math.abs(cost.yieldDrag - 6.0) < 0.0001);
  assert.ok(Math.abs(cost.totalCost - 6.0) < 0.0001);
});

test('formatCrore formats negative and positive values with Indian numbering and crore units', () => {
  const formattedPos = formatCrore(89375.12, true);
  assert.equal(formattedPos, '+₹89,375.12 cr');

  const formattedNeg = formatCrore(-14050.72);
  assert.equal(formattedNeg, '-₹14,050.72 cr');

  const polarityPos = getFlowPolarity(500);
  assert.equal(polarityPos.type, 'inflow');
  assert.equal(polarityPos.sign, '+');

  const polarityNeg = getFlowPolarity(-500);
  assert.equal(polarityNeg.type, 'outflow');
  assert.equal(polarityNeg.sign, '-');
});
