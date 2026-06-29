import { Check, X } from "lucide-react";
import {
  foreignCurrencyOptions,
  getForeignCurrencyUnit,
  type ForeignCurrencyCode,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";

type RateSheetProps = {
  isOpen: boolean;
  rateInput: string;
  foreignCurrency: ForeignCurrencyDisplay;
  foreignCurrencyCode: ForeignCurrencyCode;
  customForeignCurrencyName: string;
  onRateChange: (value: string) => void;
  onSave: () => boolean;
  onClose: () => void;
  onForeignCurrencyChange: (value: ForeignCurrencyCode) => void;
  onCustomForeignCurrencyNameChange: (value: string) => void;
};

export function RateSheet({
  isOpen,
  rateInput,
  foreignCurrency,
  foreignCurrencyCode,
  customForeignCurrencyName,
  onRateChange,
  onSave,
  onClose,
  onForeignCurrencyChange,
  onCustomForeignCurrencyNameChange,
}: RateSheetProps) {
  if (!isOpen) {
    return null;
  }

  const foreignUnit = getForeignCurrencyUnit(foreignCurrency);

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
        <label className="rate-input-label">
          <span>1 TWD =</span>
          <input
            inputMode="decimal"
            value={rateInput}
            onChange={(event) => onRateChange(event.target.value)}
            aria-label={`1 台幣可換多少${foreignCurrency.name}`}
            autoFocus
          />
          <span>{foreignUnit}</span>
        </label>
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
            <input
              value={customForeignCurrencyName}
              onChange={(event) => onCustomForeignCurrencyNameChange(event.target.value)}
              placeholder="例如：新加坡幣"
            />
          </label>
        )}
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            if (onSave()) {
              onClose();
            }
          }}
        >
          <Check size={18} />
          儲存
        </button>
      </section>
    </div>
  );
}
