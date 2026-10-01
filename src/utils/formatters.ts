export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  // If value is between 0 and 1 (like 0.907479), convert to percentage
  const pct = value <= 1 && value > 0 ? value * 100 : value;
  return `${pct.toFixed(decimals)}%`;
}

export function formatMetric(value: number, decimals: number = 4): string {
  return value.toFixed(decimals);
}

export function getRateColorClass(rate: number): string {
  if (rate >= 25) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (rate >= 15) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (rate >= 10) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
}

