import { ArrowLeftRight, Check, X } from "lucide-react";
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
  foreignCurrency: ForeignCurrencyDisplay;
  foreignCurrencyCode: ForeignCurrencyCode;
  customForeignCurrencyName: string;
  activeExchangeRate: ExchangeRate;
  rateStatusMessage: string;
  onRateChange: (value: string) => void;
  onSave: () => boolean;
  onClose: () => void;
  onRefreshReferenceRate: () => void;
  onSwapRateDirection: () => void;
  onForeignCurrencyChange: (value: ForeignCurrencyCode) => void;
  onCustomForeignCurrencyNameChange: (value: string) => void;
};

export function RateSheet({
  isOpen,
  rateInput,
  foreignCurrency,
  foreignCurrencyCode,
  customForeignCurrencyName,
  activeExchangeRate,
  rateStatusMessage,
  onRateChange,
  onSave,
  onClose,
  onRefreshReferenceRate,
  onSwapRateDirection,
  onForeignCurrencyChange,
  onCustomForeignCurrencyNameChange,
}: RateSheetProps) {
  if (!isOpen) {
    return null;
  }

  const foreignUnit = getForeignCurrencyUnit(foreignCurrency);
  const isBaseTwd = activeExchangeRate.base === "TWD";
  const baseName = isBaseTwd ? "台幣" : foreignCurrency.name;
  const targetName = isBaseTwd ? foreignCurrency.name : "台幣";
  const baseCode = isBaseTwd ? "TWD" : foreignUnit;
  const targetCode = isBaseTwd ? foreignUnit : "TWD";

  return (
    <div className="sheet-backdrop" role="presentation">
      <section className="rate-sheet" role="dialog" aria-modal="true" aria-label="設定匯率">
        <div className="sheet-title">
          <div>
            <h2>匯率設定</h2>
            <p>目前匯率以台幣換外幣計算</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="關閉">
            <X size={20} />
          </button>
        </div>
        <div className="rate-editor" aria-label="匯率方向與數值">
          <div className="rate-editor-row">
            <span className="rate-side">1 {baseName}</span>
            <button
              className="mini-swap-button"
              type="button"
              onClick={onSwapRateDirection}
              aria-label="交換匯率方向"
            >
              <ArrowLeftRight size={15} />
            </button>
            <AppInput
              inputMode="decimal"
              value={rateInput}
              onChange={(event) => onRateChange(event.target.value)}
              aria-label={`1 ${baseName}可換多少${targetName}`}
              placeholder={isBaseTwd ? "例如：5.0761" : "例如：0.19753"}
              autoFocus
            />
            <span className="rate-side">{targetName}</span>
          </div>
          <p>{baseCode} / {targetCode}</p>
          {rateStatusMessage && <p className="rate-status-message">{rateStatusMessage}</p>}
          <button className="rate-refresh-button" type="button" onClick={onRefreshReferenceRate}>
            重新取得今日匯率
          </button>
        </div>
        <label className="currency-select-label">
          外幣顯示名稱
          <select
            value={foreignCurrencyCode}
            onChange={(event) => onForeignCurrencyChange(event.target.value as ForeignCurrencyCode)}
          >
            {foreignCurrencyOptions.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.flag} {currency.name}（{currency.code}）
              </option>
            ))}
          </select>
        </label>
        {foreignCurrencyCode === "CUSTOM" && (
          <label>
            自訂外幣名稱
            <AppInput
              value={customForeignCurrencyName}
              onChange={(event) => onCustomForeignCurrencyNameChange(event.target.value)}
              placeholder="例如：新加坡幣"
            />
          </label>
        )}
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
          儲存
        </AppButton>
      </section>
    </div>
  );
}
