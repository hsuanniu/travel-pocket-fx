import { useEffect, useMemo, useRef, useState } from "react";
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
import { canFetchReferenceRate, fetchTwdReferenceRate } from "../utils/rateApi";
import {
  getTodayCacheDate,
  hasManualRateOverride,
  loadAppState,
  loadCachedReferenceRate,
  saveAppState,
  saveCachedReferenceRate,
  saveManualRateOverride,
} from "../utils/storage";

export type CalculatorState = {
  amountInput: string;
  rateInput: string;
  exchangeRate: number;
  activeExchangeRate: ExchangeRate;
  rateStatusMessage: string;
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
  swapRateDirection: () => void;
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
    getDisplayRateInput(appState),
  );
  const [rateStatusMessage, setRateStatusMessage] = useState("");
  const requestedReferenceKeyRef = useRef("");
  const currentForeignCurrencyRef = useRef(appState.foreignCurrencyCode);

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

  function applyReferenceRate(rate: number, currencyCode: ForeignCurrencyCode): void {
    setAppState((current) => {
      if (current.foreignCurrencyCode !== currencyCode) {
        return current;
      }

      const nextState = {
        ...current,
        exchangeRate: rate,
      };

      setRateInput(getDisplayRateInput(nextState));
      return nextState;
    });
  }

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    currentForeignCurrencyRef.current = appState.foreignCurrencyCode;
  }, [appState.foreignCurrencyCode]);

  useEffect(() => {
    const currencyCode = appState.foreignCurrencyCode;
    const today = getTodayCacheDate();
    const requestKey = `${today}:${currencyCode}`;

    if (!canFetchReferenceRate(currencyCode)) {
      setRateStatusMessage("");
      return;
    }

    if (hasManualRateOverride(currencyCode, today)) {
      setRateStatusMessage("");
      return;
    }

    const cachedRate = loadCachedReferenceRate(currencyCode, today);

    if (cachedRate?.status === "success") {
      applyReferenceRate(cachedRate.rate, currencyCode);
      setRateStatusMessage("每日參考匯率，可自行修改");
      return;
    }

    if (cachedRate?.status === "failed") {
      setRateStatusMessage("無法取得匯率，請手動輸入");
      return;
    }

    if (requestedReferenceKeyRef.current === requestKey) {
      return;
    }

    requestedReferenceKeyRef.current = requestKey;

    void fetchTwdReferenceRate(currencyCode).then((referenceRate) => {
      if (hasManualRateOverride(currencyCode, today)) {
        return;
      }

      if (referenceRate && referenceRate > 0) {
        saveCachedReferenceRate({
          date: today,
          currencyCode,
          rate: referenceRate,
          status: "success",
        });
        applyReferenceRate(referenceRate, currencyCode);
        if (currentForeignCurrencyRef.current === currencyCode) {
          setRateStatusMessage("每日參考匯率，可自行修改");
        }
        return;
      }

      saveCachedReferenceRate({
        date: today,
        currencyCode,
        rate: null,
        status: "failed",
      });
      if (currentForeignCurrencyRef.current === currencyCode) {
        setRateStatusMessage("無法取得匯率，請手動輸入");
      }
    });
  }, [appState.foreignCurrencyCode]);

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
    setAppState((current) => {
      const nextState = swapFxDirection(current);
      setRateInput(getDisplayRateInput(nextState));
      return nextState;
    });
  }

  function saveRate(): boolean {
    const nextRate = normalizeExchangeRate(rateInput);

    if (!nextRate) {
      return false;
    }

    setAppState((current) => ({
      ...current,
      exchangeRate: current.fromCurrency === "TWD" ? nextRate : 1 / nextRate,
    }));
    saveManualRateOverride(appState.foreignCurrencyCode, getTodayCacheDate());
    setRateStatusMessage("");
    return true;
  }

  function swapRateDirection(): void {
    setAppState((current) => {
      const nextState = swapFxDirection(current);
      setRateInput(getDisplayRateInput(nextState));
      return nextState;
    });
  }

  return {
    amountInput: appState.inputAmount,
    rateInput,
    exchangeRate: appState.exchangeRate,
    activeExchangeRate,
    rateStatusMessage,
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
    swapRateDirection,
    setForeignCurrencyCode: (value) => {
      setRateStatusMessage("");
      setRateInput("");
      setAppState((current) => ({
        ...current,
        foreignCurrencyCode: value,
        exchangeRate: current.foreignCurrencyCode === value ? current.exchangeRate : 0,
      }));
    },
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

function getDisplayRateInput(state: FxAppState): string {
  if (state.exchangeRate <= 0) {
    return "";
  }

  const displayRate = state.fromCurrency === "TWD" ? state.exchangeRate : 1 / state.exchangeRate;
  return Number(displayRate.toFixed(5)).toString();
}
