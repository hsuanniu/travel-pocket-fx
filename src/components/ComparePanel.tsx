import { ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { comparePrices } from "../features/comparison/comparePrices";

import {
  getForeignCurrencyUnit,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";
import { convertFxAmount } from "../utils/fx";
import { formatNumber, formatPercent } from "../utils/formatMoney";
import { cleanNumericInput, toNumber } from "../utils/numberInput";
import { AppInput } from "./ui/AppInput";
import { SectionTitle } from "./ui/SectionTitle";

type ComparePanelProps = {
  exchangeRate: number;
  sourceCurrency: ForeignCurrencyDisplay;
  targetCurrency: ForeignCurrencyDisplay;
};

export function ComparePanel({ exchangeRate, sourceCurrency, targetCurrency }: ComparePanelProps) {
  const foreignUnit = getForeignCurrencyUnit(sourceCurrency);
  const [foreignPrice, setForeignPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const convertedPrice = (convertFxAmount(toNumber(foreignPrice), sourceCurrency.code, targetCurrency.code, exchangeRate));
  const hasComparisonResult = convertedPrice > 0 && toNumber(targetPrice) > 0;
  const comparison = useMemo(
    () => comparePrices(convertedPrice, toNumber(targetPrice)),
    [convertedPrice, targetPrice],
  );

  const message = {
    japan: `${sourceCurrency.name}便宜 ${getForeignCurrencyUnit(targetCurrency)} ${formatNumber(comparison.difference)}`,
    taiwan: `${targetCurrency.name}價格較低 ${getForeignCurrencyUnit(targetCurrency)} ${formatNumber(comparison.difference)}`,
    same: "兩邊差不多",
    empty: "輸入價格即可比較",
  }[comparison.cheaperMarket];

  return (
    <section className={`tool-panel accent-green${isOpen ? "" : " is-collapsed"}`}>
      <button
        className="panel-toggle"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <SectionTitle icon={<ShoppingBag size={18} />} title="比價" />
        {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {isOpen && (
        <div className="panel-body">
          <div className="premium-field-stack">
            <label className="premium-field">
              {sourceCurrency.name}價格 {foreignUnit}
              <AppInput
                inputMode="decimal"
                value={foreignPrice}
                placeholder={`例如：1000`}
                onChange={(event) => setForeignPrice(cleanNumericInput(event.target.value))}
              />
            </label>
            <label className="premium-field">
              {targetCurrency.name}價格 {getForeignCurrencyUnit(targetCurrency)}
              <AppInput
                inputMode="decimal"
                value={targetPrice}
                placeholder="例如：200"
                onChange={(event) => setTargetPrice(cleanNumericInput(event.target.value))}
              />
            </label>
          </div>
          {hasComparisonResult && (
            <div className="panel-result">
              <strong>{message}</strong>
              <span>
                {sourceCurrency.name}約 {getForeignCurrencyUnit(targetCurrency)} {formatNumber(convertedPrice)} · 差{" "}
                {formatPercent(comparison.savingPercent)}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
