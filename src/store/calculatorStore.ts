import { useEffect, useRef, useState } from "react";
import { getForeignCurrencyDisplay, type ForeignCurrencyCode } from "../utils/displayCurrency";
import { convertFxAmount, getActiveExchangeRate, getDirection, normalizeExchangeRate, swapDirection as swapFxDirection, type FxAppState } from "../utils/fx";
import { toNumber } from "../utils/numberInput";
import { resolveSplitDate } from "../utils/splitDate";
import { canFetchReferenceRate, fetchReferenceRate } from "../utils/rateApi";
import { getTodayCacheDate, loadAppState, loadPairRate, saveAppState, savePairRate } from "../utils/storage";

export function useCalculatorStore() {
  const [appState, setAppState] = useState<FxAppState>(loadAppState);
  const [rateInput, setRateInput] = useState(() => displayRate(appState.exchangeRate));
  const [rateStatusMessage, setRateStatusMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const requestId = useRef(0);
  const forceRefresh = useRef(false);
  const stateRef = useRef(appState);
  stateRef.current = appState;

  useEffect(() => { saveAppState(appState); }, [appState]);

  useEffect(() => {
    const syncDate = () => {
      setAppState(current => {
        const splitDate = resolveSplitDate(current.splitDate, current.splitDateMode);
        return splitDate === current.splitDate ? current : { ...current, splitDate };
      });
    };
    // Refresh after suspension and across midnight without changing a manually chosen date.
    const onVisibilityChange = () => { if (document.visibilityState === "visible") syncDate(); };
    window.addEventListener("focus", syncDate);
    window.addEventListener("pageshow", syncDate);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const timer = window.setInterval(syncDate, 1000);
    syncDate();
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", syncDate);
      window.removeEventListener("pageshow", syncDate);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const { fromCurrency: from, toCurrency: to } = appState;
    const id = ++requestId.current;
    const force = forceRefresh.current;
    forceRefresh.current = false;
    const today = getTodayCacheDate();
    const apply = (rate: number, message: string) => {
      if (id !== requestId.current) return;
      setAppState(current => current.fromCurrency === from && current.toCurrency === to ? { ...current, exchangeRate: rate } : current);
      setRateInput(displayRate(rate));
      setRateStatusMessage(message);
    };
    if (from === to) {
      apply(1, "");
      return;
    }
    const cached = loadPairRate(from, to);
    if (!force && cached?.date === today) {
      if (cached.rate) apply(cached.rate, cached.source === "manual" ? "已使用手動匯率，今日不會自動覆蓋" : "每日參考匯率，可自行修改");
      else setRateStatusMessage("無法取得匯率，請手動輸入");
      return;
    }
    if (!canFetchReferenceRate(from) || !canFetchReferenceRate(to)) {
      setRateStatusMessage("請手動輸入匯率");
      return;
    }
    setRateStatusMessage("正在取得參考匯率");
    void fetchReferenceRate(from, to).then(rate => {
      if (id !== requestId.current) return;
      savePairRate(from, to, { source: rate ? "api" : "failed", date: today, rate });
      if (rate) apply(rate, force ? "已更新今日參考匯率" : "每日參考匯率，可自行修改");
      else setRateStatusMessage("無法取得匯率，請手動輸入");
    });
    return () => { requestId.current++; };
  }, [appState.fromCurrency, appState.toCurrency, refresh]);

  function changeCurrency(side: "fromCurrency" | "toCurrency", value: ForeignCurrencyCode) {
    if (stateRef.current[side] === value) return;
    requestId.current++;
    setAppState(current => {
      const next = { ...current, [side]: value, exchangeRate: 0 };
      return { ...next, splitCurrencyCode: next.fromCurrency, lastDirection: getDirection(next.fromCurrency, next.toCurrency) };
    });
    setRateInput("");
    setRateStatusMessage("");
  }
  function swapDirection() {
    requestId.current++;
    setAppState(current => swapFxDirection(current));
    setRateInput(displayRate(stateRef.current.exchangeRate > 0 ? 1 / stateRef.current.exchangeRate : 0));
  }
  function saveRate() {
    const rate = normalizeExchangeRate(rateInput);
    if (!rate) return false;
    requestId.current++;
    const { fromCurrency: from, toCurrency: to } = stateRef.current;
    const value = from === to ? 1 : rate;
    savePairRate(from, to, { source: "manual", date: getTodayCacheDate(), rate: value });
    setAppState(current => ({ ...current, exchangeRate: value }));
    setRateInput(displayRate(value));
    setRateStatusMessage("已使用手動匯率，今日不會自動覆蓋");
    return true;
  }
  function update<K extends keyof FxAppState>(key: K, value: FxAppState[K]) {
    setAppState(current => ({ ...current, [key]: value }));
  }
  const sourceCurrency = getForeignCurrencyDisplay(appState.fromCurrency, appState.customForeignCurrencyName);
  const targetCurrency = getForeignCurrencyDisplay(appState.toCurrency, appState.customForeignCurrencyName);
  // Preserve the original denomination of an existing bill when migrating legacy data.
  const splitIsReverse = appState.splitCurrencyCode === appState.toCurrency && appState.fromCurrency !== appState.toCurrency;
  const splitSourceCurrency = splitIsReverse ? targetCurrency : sourceCurrency;
  const splitTargetCurrency = splitIsReverse ? sourceCurrency : targetCurrency;
  const splitRate = splitIsReverse && appState.exchangeRate > 0 ? 1 / appState.exchangeRate : appState.exchangeRate;
  return {
    ...appState, amountInput: appState.inputAmount, rateInput, rateStatusMessage,
    sourceCurrency, targetCurrency, activeExchangeRate: getActiveExchangeRate(appState),
    splitSourceCurrency, splitTargetCurrency, splitRate,
    splitExchangeRate: { ...getActiveExchangeRate(appState), base: splitSourceCurrency.code, target: splitTargetCurrency.code, rate: splitRate },
    roundedConvertedAmount: convertFxAmount(toNumber(appState.inputAmount), appState.fromCurrency, appState.toCurrency, appState.exchangeRate),
    hasConversionResult: toNumber(appState.inputAmount) > 0 && appState.exchangeRate > 0,
    setAmountInput: (value: string) => update("inputAmount", value),
    clearAmount: () => update("inputAmount", ""),
    setRateInput, saveRate, swapDirection, swapRateDirection: swapDirection,
    refreshReferenceRate: () => { forceRefresh.current = true; setRefresh(value => value + 1); },
    setFromCurrency: (value: ForeignCurrencyCode) => changeCurrency("fromCurrency", value),
    setToCurrency: (value: ForeignCurrencyCode) => changeCurrency("toCurrency", value),
    setCustomForeignCurrencyName: (value: string) => update("customForeignCurrencyName", value),
    setSplitTotalAmount: (value: string) => update("splitTotalAmount", value),
    setSplitPeople: (value: string) => update("splitPeople", value),
    setSplitPayerName: (value: string) => update("splitPayerName", value),
    setSplitItemName: (value: string) => update("splitItemName", value),
    setSplitDate: (value: string) => setAppState(current => ({ ...current, splitDate: value, splitDateMode: "manual" })),
  };
}
function displayRate(rate: number): string {
  return rate > 0 ? String(Number(rate.toPrecision(10))) : "";
}
