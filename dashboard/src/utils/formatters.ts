/**
 * Formatting utilities for FlowGuard: Monthly Fund-Flow Forecasting & Cash Buffer
 * All monetary amounts are in ₹ crore.
 */

export function formatCrore(val: number | null | undefined, includeSign = false, decimals = 2): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }
  const absVal = Math.abs(val);
  const formattedAbs = absVal.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (val > 0) {
    return includeSign ? `+₹${formattedAbs} cr` : `₹${formattedAbs} cr`;
  } else if (val < 0) {
    return `-₹${formattedAbs} cr`;
  }
  return `₹${formattedAbs} cr`;
}

export function formatCroreShort(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : val > 0 ? '+' : '';
  if (abs >= 100000) {
    return `${sign}₹${(abs / 1000).toFixed(0)}k cr`;
  } else if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k cr`;
  }
  return `${sign}₹${abs.toFixed(0)} cr`;
}

export function formatPercent(val: number | null | undefined, decimals = 1, includeSign = false): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }
  const sign = includeSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
}

export function formatMonthName(monthStr: string): string {
  if (!monthStr) return '—';
  const [year, month] = monthStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;
  return `${months[monthIdx] || month} ${year}`;
}

export function getFlowPolarity(val: number): {
  type: 'inflow' | 'outflow' | 'neutral';
  label: string;
  sign: string;
  colorClass: string;
  badgeBg: string;
} {
  if (val > 0) {
    return {
      type: 'inflow',
      label: 'Net Inflow',
      sign: '+',
      colorClass: 'text-[#A9F2E7]',
      badgeBg: 'bg-[#00D4C3]/15 text-[#48F0DE] border border-[#00D4C3]/30',
    };
  } else if (val < 0) {
    return {
      type: 'outflow',
      label: 'Net Outflow',
      sign: '-',
      colorClass: 'text-[#FF7B72]',
      badgeBg: 'bg-[#FF7B72]/15 text-[#FF7B72] border border-[#FF7B72]/30',
    };
  }
  return {
    type: 'neutral',
    label: 'Neutral / Zero',
    sign: '',
    colorClass: 'text-[#A8C6C3]',
    badgeBg: 'bg-[#103238] text-[#A8C6C3] border border-[#1D5555]',
  };
}
