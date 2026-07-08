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
  splitTotalAmount: `${storagePrefix}:splitTotalAmount`,
  splitPeople: `${storagePrefix}:splitPeople`,
  splitPayerName: `${storagePrefix}:splitPayerName`,
  splitItemName: `${storagePrefix}:splitItemName`,
  splitDate: `${storagePrefix}:splitDate`,
  rateSource: `${storagePrefix}:rateSource`,
  rateDate: `${storagePrefix}:rateDate`,
  currencyCode: `${storagePrefix}:currencyCode`,
  rateValue: `${storagePrefix}:rateValue`,
  referenceRateDate: `${storagePrefix}:referenceRateDate`,
  referenceRateCurrency: `${storagePrefix}:referenceRateCurrency`,
  referenceRateValue: `${storagePrefix}:referenceRateValue`,
  referenceRateStatus: `${storagePrefix}:referenceRateStatus`,
  manualRateDate: `${storagePrefix}:manualRateDate`,
  manualRateCurrency: `${storagePrefix}:manualRateCurrency`,
} as const;

const legacyKeys = {
  rate: `${legacyPrefix}:rate`,
  amount: `${legacyPrefix}:amount`,
  direction: `${legacyPrefix}:direction`,
} as const;

export const defaultAppState: FxAppState = {
  fromCurrency: "TWD",
  toCurrency: "JPY",
  inputAmount: "",
  exchangeRate: 0,
  lastDirection: "TWD_TO_JPY",
  foreignCurrencyCode: "JPY",
  customForeignCurrencyName: "",
  splitTotalAmount: "",
  splitPeople: "",
  splitPayerName: "",
  splitItemName: "",
  splitDate: getTodayInputValue(),
};

export type DailyRateSource = "api" | "manual" | "failed";

export type DailyRateRecord = {
  source: DailyRateSource;
  currencyCode: ForeignCurrencyCode;
  date: string;
  rate: number | null;
};

export function loadAppState(): FxAppState {
  if (!hasSavedAppState() && !hasLegacyAppState()) {
    return defaultAppState;
  }

  const storedRate = readNumber(keys.exchangeRate);
  const fromCurrency = readCurrency(keys.fromCurrency);
  const toCurrency = readCurrency(keys.toCurrency);

  if (storedRate !== null && fromCurrency && toCurrency) {
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
      splitTotalAmount: readString(keys.splitTotalAmount) ?? defaultAppState.splitTotalAmount,
      splitPeople: readString(keys.splitPeople) ?? defaultAppState.splitPeople,
      splitPayerName: readString(keys.splitPayerName) ?? defaultAppState.splitPayerName,
      splitItemName: readString(keys.splitItemName) ?? defaultAppState.splitItemName,
      splitDate: readString(keys.splitDate) ?? defaultAppState.splitDate,
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
  writeString(keys.splitTotalAmount, state.splitTotalAmount);
  writeString(keys.splitPeople, state.splitPeople);
  writeString(keys.splitPayerName, state.splitPayerName);
  writeString(keys.splitItemName, state.splitItemName);
  writeString(keys.splitDate, state.splitDate);
}

export function getTodayCacheDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function loadDailyRateRecord(currencyCode: ForeignCurrencyCode): DailyRateRecord | null {
  const date = readString(keys.rateDate);
  const storedCurrency = readForeignCurrency(keys.currencyCode);
  const source = readDailyRateSource();

  if (!date || storedCurrency !== currencyCode || !source) {
    return loadLegacyDailyRateRecord(currencyCode);
  }

  const storedRate = readNumber(keys.rateValue);

  if (source !== "failed" && (!storedRate || storedRate <= 0)) {
    return null;
  }

  return {
    source,
    currencyCode,
    date,
    rate: source === "failed" ? null : storedRate,
  };
}

export function saveDailyRateRecord(record: DailyRateRecord): void {
  writeString(keys.rateSource, record.source);
  writeString(keys.rateDate, record.date);
  writeString(keys.currencyCode, record.currencyCode);
  writeString(keys.rateValue, record.rate === null ? "" : String(record.rate));
}

export function hasManualRateOverride(currencyCode: ForeignCurrencyCode, date: string): boolean {
  const record = loadDailyRateRecord(currencyCode);

  return record?.source === "manual" && record.date === date;
}

export function saveManualRateOverride(
  currencyCode: ForeignCurrencyCode,
  date: string,
  rate: number,
): void {
  saveDailyRateRecord({
    source: "manual",
    currencyCode,
    date,
    rate,
  });
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
    splitTotalAmount: defaultAppState.splitTotalAmount,
    splitPeople: defaultAppState.splitPeople,
    splitPayerName: defaultAppState.splitPayerName,
    splitItemName: defaultAppState.splitItemName,
    splitDate: defaultAppState.splitDate,
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

function readDailyRateSource(): DailyRateSource | null {
  const value = readString(keys.rateSource);

  return value === "api" || value === "manual" || value === "failed" ? value : null;
}

function loadLegacyDailyRateRecord(currencyCode: ForeignCurrencyCode): DailyRateRecord | null {
  const manualDate = readString(keys.manualRateDate);
  const manualCurrency = readForeignCurrency(keys.manualRateCurrency);
  const referenceDate = readString(keys.referenceRateDate);
  const referenceCurrency = readForeignCurrency(keys.referenceRateCurrency);
  const referenceStatus = readString(keys.referenceRateStatus);
  const referenceRate = readNumber(keys.referenceRateValue);

  if (manualDate && manualCurrency === currencyCode) {
    return {
      source: "manual",
      currencyCode,
      date: manualDate,
      rate: null,
    };
  }

  if (referenceDate && referenceCurrency === currencyCode && referenceStatus === "failed") {
    return {
      source: "failed",
      currencyCode,
      date: referenceDate,
      rate: null,
    };
  }

  if (
    referenceDate &&
    referenceCurrency === currencyCode &&
    referenceStatus === "success" &&
    referenceRate !== null &&
    referenceRate > 0
  ) {
    return {
      source: "api",
      currencyCode,
      date: referenceDate,
      rate: referenceRate,
    };
  }

  return null;
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
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function hasSavedAppState(): boolean {
  return readString(keys.stateVersion) !== null || readString(keys.exchangeRate) !== null;
}

function hasLegacyAppState(): boolean {
  return readString(legacyKeys.rate) !== null || readString(legacyKeys.amount) !== null;
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

function getTodayInputValue(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}
