import { ArrowLeftRight, Settings2 } from "lucide-react";
import type { ExchangeRate } from "../features/currency/currencyTypes";
import { currencies } from "../features/currency/currencies";
import {
  getForeignCurrencyUnit,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";
import { formatRate } from "../utils/formatMoney";

type CurrencyHeaderProps = {
  exchangeRate: ExchangeRate;
  twdToJpyRate: number;
  foreignCurrency: ForeignCurrencyDisplay;
  onSwapClick: () => void;
  onSettingsClick: () => void;
};

export function CurrencyHeader({
  exchangeRate,
  twdToJpyRate,
  foreignCurrency,
  onSwapClick,
  onSettingsClick,
}: CurrencyHeaderProps) {
  const base = currencies[exchangeRate.base];
  const target = currencies[exchangeRate.target];
  const foreignUnit = getForeignCurrencyUnit(foreignCurrency);
  const baseLabel = exchangeRate.base === "TWD" ? base.code : foreignUnit;
  const targetLabel = exchangeRate.target === "TWD" ? target.code : foreignUnit;

  return (
    <header className="currency-header">
      <div>
        <div className="currency-pair">
          <span>{exchangeRate.base === "TWD" ? base.flag : foreignCurrency.flag}</span>
          <strong>
            {baseLabel} → {targetLabel}
          </strong>
        </div>
        <p>
          {twdToJpyRate > 0
            ? `1 TWD = ${formatRate(twdToJpyRate)} ${foreignUnit}`
            : "請設定匯率"}
        </p>
      </div>
      <div className="header-actions">
        <button className="icon-button" type="button" onClick={onSwapClick} aria-label="調換幣別">
          <ArrowLeftRight size={19} />
        </button>
        <button className="icon-button" type="button" onClick={onSettingsClick} aria-label="設定匯率">
          <Settings2 size={20} />
        </button>
      </div>
    </header>
  );
}
