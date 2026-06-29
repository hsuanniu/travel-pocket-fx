import type { CurrencyCode, ExchangeRate } from "../features/currency/currencyTypes";
import type { ForeignCurrencyCode } from "./displayCurrency";
import type { FxAppState, FxDirection } from "./fx";
import { getDirection } from "./fx";

const storagePrefix = "travel-pocket-fx";
const legacyPrefix = "travel-smart-calculator";

const keys = {
  stateVersion: `${storagePrefix}:stateVersion`,
  fromCurrency: `${storagePrefix}:fromCurrency`,
  toCurrency: `${storagePrefix}:toCurrency`,
  inputAmount: `${storagePrefix}:inputAmount`,
  exchangeRate: `${storagePrefix}:exchangeRate`,
  lastDirection: `${storagePrefix}:lastDirection`,
  foreignCurrencyCode: `${storagePrefix}:foreignCurrencyCode`,
  customForeignCurrencyName: `${storagePrefix}:customForeignCurrencyName`,
} as const;

const legacyKeys = {
  rate: `${legacyPrefix}:rate`,
  amount: `${legacyPrefix}:amount`,
  direction: `${legacyPrefix}:direction`,
} as const;

export const defaultAppState: FxAppState = {
  fromCurrency: "TWD",
  toCurrency: "JPY",
  inputAmount: "1000",
  exchangeRate: 4.8,
  lastDirection: "TWD_TO_JPY",
  foreignCurrencyCode: "JPY",
  customForeignCurrencyName: "",
};

export function loadAppState(): FxAppState {
  const storedRate = readNumber(keys.exchangeRate);
  const fromCurrency = readCurrency(keys.fromCurrency);
  const toCurrency = readCurrency(keys.toCurrency);

  if (storedRate && fromCurrency && toCurrency) {
    const lastDirection = readDirection(keys.lastDirection) ?? getDirection(fromCurrency, toCurrency);

    return {
      fromCurrency,
      toCurrency,
      inputAmount: readString(keys.inputAmount) ?? defaultAppState.inputAmount,
      exchangeRate: storedRate,
      lastDirection,
      foreignCurrencyCode: readForeignCurrency(keys.foreignCurrencyCode) ?? defaultAppState.foreignCurrencyCode,
      customForeignCurrencyName:
        readString(keys.customForeignCurrencyName) ?? defaultAppState.customForeignCurrencyName,
    };
  }

  return migrateLegacyState();
}

export function saveAppState(state: FxAppState): void {
  writeString(keys.stateVersion, "1");
  writeString(keys.fromCurrency, state.fromCurrency);
  writeString(keys.toCurrency, state.toCurrency);
  writeString(keys.inputAmount, state.inputAmount);
  writeString(keys.exchangeRate, String(state.exchangeRate));
  writeString(keys.lastDirection, state.lastDirection);
  writeString(keys.foreignCurrencyCode, state.foreignCurrencyCode);
  writeString(keys.customForeignCurrencyName, state.customForeignCurrencyName);
}

function migrateLegacyState(): FxAppState {
  const legacyRate = readJson<ExchangeRate>(legacyKeys.rate);
  const legacyDirection = readJson<{ base?: CurrencyCode; target?: CurrencyCode }>(legacyKeys.direction);
  const inputAmount = readJson<string>(legacyKeys.amount) ?? defaultAppState.inputAmount;

  const exchangeRate =
    legacyRate && Number.isFinite(legacyRate.rate) && legacyRate.rate > 0
      ? normalizeLegacyRate(legacyRate.rate)
      : defaultAppState.exchangeRate;
  const fromCurrency: CurrencyCode =
    legacyDirection?.base === "JPY" ? "JPY" : defaultAppState.fromCurrency;
  const toCurrency: CurrencyCode = fromCurrency === "JPY" ? "TWD" : "JPY";
  const migratedState: FxAppState = {
    fromCurrency,
    toCurrency,
    inputAmount,
    exchangeRate,
    lastDirection: getDirection(fromCurrency, toCurrency),
    foreignCurrencyCode: defaultAppState.foreignCurrencyCode,
    customForeignCurrencyName: defaultAppState.customForeignCurrencyName,
  };

  saveAppState(migratedState);
  return migratedState;
}

function readForeignCurrency(key: string): ForeignCurrencyCode | null {
  const value = readString(key);

  return value === "JPY" ||
    value === "KRW" ||
    value === "USD" ||
    value === "EUR" ||
    value === "HKD" ||
    value === "CNY" ||
    value === "VND" ||
    value === "THB" ||
    value === "CUSTOM"
    ? value
    : null;
}

function normalizeLegacyRate(rate: number): number {
  return rate < 1 ? 1 / rate : rate;
}

function readCurrency(key: string): CurrencyCode | null {
  const value = readString(key);
  return value === "TWD" || value === "JPY" ? value : null;
}

function readDirection(key: string): FxDirection | null {
  const value = readString(key);
  return value === "TWD_TO_JPY" || value === "JPY_TO_TWD" ? value : null;
}

function readNumber(key: string): number | null {
  const value = Number(readString(key));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function readString(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeString(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The calculator should keep working even when storage is unavailable.
  }
}

function readJson<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}
