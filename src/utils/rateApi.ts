import type { ForeignCurrencyCode } from "./displayCurrency";

const apiBaseUrl = "https://api.frankfurter.dev/v2";

type FrankfurterPairResponse = {
  rate?: number;
};

const supportedReferenceCurrencies: ForeignCurrencyCode[] = [
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

export async function fetchTwdReferenceRate(
  foreignCurrencyCode: ForeignCurrencyCode,
): Promise<number | null> {
  if (!canFetchReferenceRate(foreignCurrencyCode)) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/rate/TWD/${foreignCurrencyCode}`);

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
