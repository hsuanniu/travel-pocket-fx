import { X } from "lucide-react";
import type { CurrencyCode } from "../features/currency/currencyTypes";
import { currencies } from "../features/currency/currencies";
import {
  getForeignCurrencyUnit,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";
import { cleanNumericInput } from "../utils/numberInput";
import { formatNumber } from "../utils/formatMoney";

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

  return (
    <section className="converter-panel" aria-label={`${baseLabel} 換算 ${targetLabel}`}>
      <div className="amount-row">
        <input
          inputMode="decimal"
          value={amountInput}
          onChange={(event) => onChange(cleanNumericInput(event.target.value))}
          aria-label={`${baseLabel} 金額`}
          placeholder="請輸入金額"
        />
        <span>{baseLabel}</span>
        {amountInput && (
          <button className="clear-button" type="button" onClick={onClear} aria-label="清除金額">
            <X size={18} />
          </button>
        )}
      </div>
      {hasResult && (
        <div className="result-row">
          <span>約</span>
          <strong>
            {targetSymbol ? `${targetSymbol} ` : ""}
            {formatNumber(roundedConvertedAmount)}
          </strong>
        </div>
      )}
    </section>
  );
}
