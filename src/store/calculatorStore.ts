import { useEffect, useMemo, useState } from "react";
import type { ExchangeRate } from "../features/currency/currencyTypes";
import { cowRoundAmount } from "../features/rounding/cowRounding";
import {
  getForeignCurrencyDisplay,
  type ForeignCurrencyCode,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";
import {
  convertFxAmount,
  getActiveExchangeRate,
  normalizeExchangeRate,
  swapDirection as swapFxDirection,
  type FxAppState,
} from "../utils/fx";
import { toNumber } from "../utils/numberInput";
import { loadAppState, saveAppState } from "../utils/storage";

export type CalculatorState = {
  amountInput: string;
  rateInput: string;
  exchangeRate: number;
  activeExchangeRate: ExchangeRate;
  foreignCurrency: ForeignCurrencyDisplay;
  foreignCurrencyCode: ForeignCurrencyCode;
  customForeignCurrencyName: string;
  roundedConvertedAmount: number;
  hasConversionResult: boolean;
  splitTotalAmount: string;
  splitPeople: string;
  splitItemName: string;
  splitDate: string;
  setAmountInput: (value: string) => void;
  appendAmount: (value: string) => void;
  clearAmount: () => void;
  swapDirection: () => void;
  setRateInput: (value: string) => void;
  saveRate: () => boolean;
  setForeignCurrencyCode: (value: ForeignCurrencyCode) => void;
  setCustomForeignCurrencyName: (value: string) => void;
  setSplitTotalAmount: (value: string) => void;
  setSplitPeople: (value: string) => void;
  setSplitItemName: (value: string) => void;
  setSplitDate: (value: string) => void;
};

export function useCalculatorStore(): CalculatorState {
  const [appState, setAppState] = useState<FxAppState>(() => loadAppState());
  const [rateInput, setRateInput] = useState(() =>
    appState.exchangeRate > 0 ? String(appState.exchangeRate) : "",
  );

  const numericAmount = toNumber(appState.inputAmount);
  const activeExchangeRate = useMemo(() => getActiveExchangeRate(appState), [appState]);
  const foreignCurrency = useMemo(
    () =>
      getForeignCurrencyDisplay(
        appState.foreignCurrencyCode,
        appState.customForeignCurrencyName,
      ),
    [appState.foreignCurrencyCode, appState.customForeignCurrencyName],
  );
  const convertedAmount = useMemo(
    () =>
      convertFxAmount(
        numericAmount,
        appState.fromCurrency,
        appState.toCurrency,
        appState.exchangeRate,
      ),
    [numericAmount, appState.fromCurrency, appState.toCurrency, appState.exchangeRate],
  );
  const roundedConvertedAmount = useMemo(() => cowRoundAmount(convertedAmount), [convertedAmount]);
  const hasConversionResult = numericAmount > 0 && appState.exchangeRate > 0;

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  function appendAmount(value: string): void {
    setAppState((current) => ({
      ...current,
      inputAmount: `${current.inputAmount}${value}`.replace(/^0+(?=\d)/, ""),
    }));
  }

  function clearAmount(): void {
    setAppState((current) => ({
      ...current,
      inputAmount: "",
    }));
  }

  function swapDirection(): void {
    setAppState((current) => swapFxDirection(current));
  }

  function saveRate(): boolean {
    const nextRate = normalizeExchangeRate(rateInput);

    if (!nextRate) {
      return false;
    }

    setAppState((current) => ({
      ...current,
      exchangeRate: nextRate,
    }));
    return true;
  }

  return {
    amountInput: appState.inputAmount,
    rateInput,
    exchangeRate: appState.exchangeRate,
    activeExchangeRate,
    foreignCurrency,
    foreignCurrencyCode: appState.foreignCurrencyCode,
    customForeignCurrencyName: appState.customForeignCurrencyName,
    roundedConvertedAmount,
    hasConversionResult,
    splitTotalAmount: appState.splitTotalAmount,
    splitPeople: appState.splitPeople,
    splitItemName: appState.splitItemName,
    splitDate: appState.splitDate,
    setAmountInput: (value) =>
      setAppState((current) => ({
        ...current,
        inputAmount: value,
      })),
    appendAmount,
    clearAmount,
    swapDirection,
    setRateInput,
    saveRate,
    setForeignCurrencyCode: (value) =>
      setAppState((current) => ({
        ...current,
        foreignCurrencyCode: value,
      })),
    setCustomForeignCurrencyName: (value) =>
      setAppState((current) => ({
        ...current,
        customForeignCurrencyName: value,
      })),
    setSplitTotalAmount: (value) =>
      setAppState((current) => ({
        ...current,
        splitTotalAmount: value,
      })),
    setSplitPeople: (value) =>
      setAppState((current) => ({
        ...current,
        splitPeople: value,
      })),
    setSplitItemName: (value) =>
      setAppState((current) => ({
        ...current,
        splitItemName: value,
      })),
    setSplitDate: (value) =>
      setAppState((current) => ({
        ...current,
        splitDate: value,
      })),
  };
}
