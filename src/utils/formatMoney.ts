export function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRate(value: number): string {
  return value.toFixed(5);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
