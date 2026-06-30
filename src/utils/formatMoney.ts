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

export function formatDisplayAmount(value: string): string {
  const numericValue = Number(value);
  const digitCount = value.replace(/\D/g, "").length;

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  if (digitCount >= 10) {
    return formatCompactChineseNumber(numericValue);
  }

  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: value.includes(".") ? 4 : 0,
  }).format(numericValue);
}

function formatCompactChineseNumber(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 100_000_000) {
    const yiValue = absValue / 100_000_000;

    return `${sign}${new Intl.NumberFormat("zh-TW", {
      maximumFractionDigits: yiValue >= 10 ? 1 : 2,
    }).format(yiValue)}億`;
  }

  const wanValue = Math.floor(absValue / 10_000);

  return `${sign}${formatNumber(wanValue)}萬`;
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
