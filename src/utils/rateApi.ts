import type { ForeignCurrencyCode } from "./displayCurrency";

const apiBaseUrl = "https://api.frankfurter.dev/v2";

type FrankfurterPairResponse = {
  rate?: number;
};

const supportedReferenceCurrencies: ForeignCurrencyCode[] = [
  "TWD",
  "JPY",
  "KRW",
  "USD",
  "EUR",
  "HKD",
  "CNY",
  "VND",
  "THB",
];

export function canFetchReferenceRate(code: ForeignCurrencyCode): boolean {
  return supportedReferenceCurrencies.includes(code);
}

export async function fetchReferenceRate(
  from: ForeignCurrencyCode,
  to: ForeignCurrencyCode,
): Promise<number | null> {
  if (!canFetchReferenceRate(from) || !canFetchReferenceRate(to)) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/rate/${from}/${to}`, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as FrankfurterPairResponse;
    const rate = Number(data.rate);

    return Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}
