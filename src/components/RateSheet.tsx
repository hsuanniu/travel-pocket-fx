import { ArrowLeftRight, Check, X } from "lucide-react";
import { useEffect } from "react";
import type { ExchangeRate } from "../features/currency/currencyTypes";
import {
  foreignCurrencyOptions,
  getForeignCurrencyUnit,
  type ForeignCurrencyCode,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";
import { AppButton } from "./ui/AppButton";
import { AppInput } from "./ui/AppInput";

type RateSheetProps = {
  isOpen: boolean;
  rateInput: string;
  sourceCurrency: ForeignCurrencyDisplay;
  targetCurrency: ForeignCurrencyDisplay;
  customForeignCurrencyName: string;
  activeExchangeRate: ExchangeRate;
  rateStatusMessage: string;
  onRateChange: (value: string) => void;
  onSave: () => boolean;
  onClose: () => void;
  onRefreshReferenceRate: () => void;
  onSwapRateDirection: () => void;
  onFromCurrencyChange: (value: ForeignCurrencyCode) => void;
  onToCurrencyChange: (value: ForeignCurrencyCode) => void;
  onCustomForeignCurrencyNameChange: (value: string) => void;
};

export function RateSheet({
  isOpen,
  rateInput,
  sourceCurrency,
  targetCurrency,
  customForeignCurrencyName,
  rateStatusMessage,
  onRateChange,
  onSave,
  onClose,
  onRefreshReferenceRate,
  onSwapRateDirection,
  onFromCurrencyChange,
  onToCurrencyChange,
  onCustomForeignCurrencyNameChange,
}: RateSheetProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const baseName = sourceCurrency.name;
  const targetName = targetCurrency.name;
  const baseCode = getForeignCurrencyUnit(sourceCurrency);
  const targetCode = getForeignCurrencyUnit(targetCurrency);
  const shouldShowRateStatus =
    Boolean(rateStatusMessage) && rateStatusMessage !== "每日參考匯率，可自行修改";

  return (
    <div
      className="sheet-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="rate-sheet" role="dialog" aria-modal="true" aria-label="幣別設定">
        <div className="sheet-title">
          <div>
            <h2>幣別設定</h2>
            <p>更換幣別或設定今日匯率</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="關閉">
            <X size={20} />
          </button>
        </div>

        <section className="sheet-group" aria-label="換算方向">
          <div className="sheet-section-heading">
            <span>換算方向</span>
            <small>主畫面會同步更新</small>
          </div>
          <div className="currency-direction-editor" aria-label="來源幣別與目標幣別">
            <label className="currency-select-label">
              來源幣別
              <select value={sourceCurrency.code} onChange={event => onFromCurrencyChange(event.target.value as ForeignCurrencyCode)}>
                {foreignCurrencyOptions.map(currency => <option key={currency.code} value={currency.code}>{currency.flag} {currency.name}（{currency.code}）</option>)}
              </select>
            </label>
            <button className="sheet-swap-button" type="button" onClick={onSwapRateDirection} aria-label="交換來源與目標幣別"><ArrowLeftRight size={16} /></button>
            <label className="currency-select-label">
              目標幣別
              <select value={targetCurrency.code} onChange={event => onToCurrencyChange(event.target.value as ForeignCurrencyCode)}>
                {foreignCurrencyOptions.map(currency => <option key={currency.code} value={currency.code}>{currency.flag} {currency.name}（{currency.code}）</option>)}
              </select>
            </label>
          </div>
        </section>

        {(sourceCurrency.code === "CUSTOM" || targetCurrency.code === "CUSTOM") && (
          <label className="sheet-group custom-currency-field">
            自訂外幣名稱
            <AppInput
              value={customForeignCurrencyName}
              onChange={(event) => onCustomForeignCurrencyNameChange(event.target.value)}
              placeholder="例如：新加坡幣"
            />
          </label>
        )}

        <section className="rate-editor sheet-group" aria-label="匯率設定">
          <div className="sheet-section-heading">
            <span>今日匯率</span>
            <small>每日參考匯率，可自行修改</small>
          </div>
          <button className="rate-refresh-button" type="button" onClick={onRefreshReferenceRate} disabled={sourceCurrency.code === "CUSTOM" || targetCurrency.code === "CUSTOM"}>
            自動更新今日匯率
          </button>
          <div className="rate-manual-label">手動輸入匯率</div>
          <div className="rate-editor-row">
            <span className="rate-side">1 {baseName}</span>
            <AppInput
              inputMode="decimal"
              value={rateInput}
              onChange={(event) => onRateChange(event.target.value)}
              aria-label={`1 ${baseName}可換多少${targetName}`}
              placeholder="請輸入匯率"
              autoFocus
            />
            <span className="rate-side">{targetName}</span>
          </div>
          <p>{baseCode} / {targetCode}</p>
          {shouldShowRateStatus && <p className="rate-status-message">{rateStatusMessage}</p>}
        </section>
        <AppButton
          variant="primary"
          type="button"
          onClick={() => {
            if (onSave()) {
              onClose();
            }
          }}
        >
          <Check size={18} />
          儲存手動匯率
        </AppButton>
      </section>
    </div>
  );
}
