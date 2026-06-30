export function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactMoney(value: number): string {
  if (Math.abs(value) >= 100_000_000) {
    const yiValue = value / 100_000_000;

    return `${new Intl.NumberFormat("zh-TW", {
      maximumFractionDigits: yiValue >= 10 ? 1 : 2,
    }).format(yiValue)}億`;
  }

  return formatNumber(value);
}

export function formatRate(value: number): string {
  return value.toFixed(5);
}

export function formatRateCompact(value: number): string {
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 5,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
