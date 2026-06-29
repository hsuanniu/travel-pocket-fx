import { ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { comparePrices } from "../features/comparison/comparePrices";
import { cowRoundTwd } from "../features/rounding/cowRounding";
import {
  getForeignCurrencyUnit,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";
import { convertJpyToTwd } from "../utils/fx";
import { formatNumber, formatPercent } from "../utils/formatMoney";
import { cleanNumericInput, toNumber } from "../utils/numberInput";

type ComparePanelProps = {
  exchangeRate: number;
  foreignCurrency: ForeignCurrencyDisplay;
};

export function ComparePanel({ exchangeRate, foreignCurrency }: ComparePanelProps) {
  const foreignUnit = getForeignCurrencyUnit(foreignCurrency);
  const [foreignPrice, setForeignPrice] = useState("");
  const [taiwanPrice, setTaiwanPrice] = useState("");
  const foreignTwdPrice = cowRoundTwd(convertJpyToTwd(toNumber(foreignPrice), exchangeRate));
  const hasComparisonResult = foreignTwdPrice > 0 && toNumber(taiwanPrice) > 0;
  const comparison = useMemo(
    () => comparePrices(foreignTwdPrice, toNumber(taiwanPrice)),
    [foreignTwdPrice, taiwanPrice],
  );

  const message = {
    japan: `${foreignCurrency.name}便宜 NT$ ${formatNumber(comparison.difference)}`,
    taiwan: `台灣便宜 NT$ ${formatNumber(comparison.difference)}`,
    same: "兩邊差不多",
    empty: "輸入價格即可比較",
  }[comparison.cheaperMarket];

  return (
    <section className="tool-panel accent-green">
      <div className="panel-title">
        <ShoppingBag size={18} />
        <h2>比價</h2>
      </div>
      <label>
        {foreignCurrency.name}價格 {foreignUnit}
        <input
          inputMode="decimal"
          value={foreignPrice}
          placeholder={`例如：1000`}
          onChange={(event) => setForeignPrice(cleanNumericInput(event.target.value))}
        />
      </label>
      <label>
        台灣價格 TWD
        <input
          inputMode="decimal"
          value={taiwanPrice}
          placeholder="例如：200"
          onChange={(event) => setTaiwanPrice(cleanNumericInput(event.target.value))}
        />
      </label>
      {hasComparisonResult && (
        <div className="panel-result">
          <strong>{message}</strong>
          <span>
            {foreignCurrency.name}約 NT$ {formatNumber(foreignTwdPrice)} · 差{" "}
            {formatPercent(comparison.savingPercent)}
          </span>
        </div>
      )}
    </section>
  );
}
