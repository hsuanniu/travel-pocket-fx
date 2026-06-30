import { X } from "lucide-react";
import type { CurrencyCode } from "../features/currency/currencyTypes";
import { currencies } from "../features/currency/currencies";
import {
  getForeignCurrencyUnit,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";
import { cleanNumericInput } from "../utils/numberInput";
import { formatCompactMoney } from "../utils/formatMoney";

type MainConverterProps = {
  amountInput: string;
  baseCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
  foreignCurrency: ForeignCurrencyDisplay;
  roundedConvertedAmount: number;
  hasResult: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
};

export function MainConverter({
  amountInput,
  baseCurrency,
  targetCurrency,
  foreignCurrency,
  roundedConvertedAmount,
  hasResult,
  onChange,
  onClear,
}: MainConverterProps) {
  const target = currencies[targetCurrency];
  const foreignUnit = getForeignCurrencyUnit(foreignCurrency);
  const baseLabel = baseCurrency === "TWD" ? baseCurrency : foreignUnit;
  const targetLabel = targetCurrency === "TWD" ? targetCurrency : foreignUnit;
  const targetSymbol = targetCurrency === "TWD" ? target.symbol : foreignCurrency.symbol;
  const resultLabel = targetCurrency === "TWD" ? "約新台幣" : `約${foreignCurrency.name}`;
  const amountSizeClass = getAmountSizeClass(amountInput);

  return (
    <section className="converter-panel" aria-label={`${baseLabel} 換算 ${targetLabel}`}>
      <div className="amount-row">
        <div className="amount-input-shell">
          <input
            className={`amount-input ${amountSizeClass}`}
            inputMode="decimal"
            value={amountInput}
            onChange={(event) => onChange(cleanNumericInput(event.target.value))}
            aria-label={`${baseLabel} 金額`}
            placeholder="請輸入金額"
          />
        </div>
        <div className="amount-actions">
          <span>{baseLabel}</span>
          {amountInput && (
            <button className="clear-button" type="button" onClick={onClear} aria-label="清除金額">
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      {hasResult && (
        <div className="result-row">
          <span>{resultLabel}</span>
          <strong>
            {targetSymbol ? `${targetSymbol} ` : ""}
            {formatCompactMoney(roundedConvertedAmount)}
          </strong>
        </div>
      )}
    </section>
  );
}

function getAmountSizeClass(value: string): string {
  const digitCount = value.replace(/\D/g, "").length;

  if (digitCount >= 10) {
    return "amount-size-small";
  }

  if (digitCount >= 7) {
    return "amount-size-compact";
  }

  return "amount-size-large";
}
