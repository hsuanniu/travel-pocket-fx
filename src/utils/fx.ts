import type { CurrencyCode, ExchangeRate } from "../features/currency/currencyTypes";
import type { ForeignCurrencyCode } from "./displayCurrency";

export type FxDirection = "TWD_TO_JPY" | "JPY_TO_TWD";

export type FxAppState = {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  inputAmount: string;
  exchangeRate: number;
  lastDirection: FxDirection;
  foreignCurrencyCode: ForeignCurrencyCode;
  customForeignCurrencyName: string;
  splitTotalAmount: string;
  splitPeople: string;
  splitPayerName: string;
  splitItemName: string;
  splitDate: string;
};

export function getDirection(fromCurrency: CurrencyCode, toCurrency: CurrencyCode): FxDirection {
  return fromCurrency === "TWD" && toCurrency === "JPY" ? "TWD_TO_JPY" : "JPY_TO_TWD";
}

export function swapDirection(state: FxAppState): FxAppState {
  const fromCurrency = state.toCurrency;
  const toCurrency = state.fromCurrency;

  return {
    ...state,
    fromCurrency,
    toCurrency,
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

  if (fromCurrency === "TWD" && toCurrency === "JPY") {
    return amount * exchangeRate;
  }

  return amount / exchangeRate;
}

export function convertJpyToTwd(jpyAmount: number, exchangeRate: number): number {
  return convertFxAmount(jpyAmount, "JPY", "TWD", exchangeRate);
}

export function getActiveExchangeRate(state: FxAppState): ExchangeRate {
  const directionRate =
    state.fromCurrency === "TWD" && state.toCurrency === "JPY"
      ? state.exchangeRate
      : state.exchangeRate > 0
        ? 1 / state.exchangeRate
        : 0;

  return {
    base: state.fromCurrency,
    target: state.toCurrency,
    rate: directionRate,
    updatedAt: Date.now(),
    source: "manual",
  };
}
