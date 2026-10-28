import type { CurrencyCode, ExchangeRate } from "../features/currency/currencyTypes";
import type { ForeignCurrencyCode } from "./displayCurrency";

export type FxDirection = `${CurrencyCode}_TO_${CurrencyCode}`;

export type FxAppState = {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  inputAmount: string;
  exchangeRate: number;
  lastDirection: FxDirection;
  foreignCurrencyCode: ForeignCurrencyCode;
  customForeignCurrencyName: string;
  splitTotalAmount: string;
  splitCurrencyCode?: CurrencyCode;
  splitPeople: string;
  splitPayerName: string;
  splitItemName: string;
  splitDate: string;
  splitDateMode?: "auto" | "manual";
};

export function getDirection(fromCurrency: CurrencyCode, toCurrency: CurrencyCode): FxDirection {
  return `${fromCurrency}_TO_${toCurrency}`;
}

export function swapDirection(state: FxAppState): FxAppState {
  const fromCurrency = state.toCurrency;
  const toCurrency = state.fromCurrency;

  return {
    ...state,
    fromCurrency,
    toCurrency,
    splitCurrencyCode: fromCurrency,
    exchangeRate: state.exchangeRate > 0 ? 1 / state.exchangeRate : 0,
    lastDirection: getDirection(fromCurrency, toCurrency),
  };
}

export function normalizeExchangeRate(value: string): number | null {
  const rate = Number(value);

  if (!Number.isFinite(rate) || rate <= 0) {
    return null;
  }

  return rate;
}

export function convertFxAmount(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  exchangeRate: number,
): number {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return 0;
  }

  if (fromCurrency === toCurrency) {
    return amount;
  }

  return amount * exchangeRate;
}

export function getActiveExchangeRate(state: FxAppState): ExchangeRate {
  return {
    base: state.fromCurrency,
    target: state.toCurrency,
    rate: state.exchangeRate,
    updatedAt: Date.now(),
    source: "manual",
  };
}
