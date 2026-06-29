import { ArrowLeftRight, Settings2 } from "lucide-react";
import type { ExchangeRate } from "../features/currency/currencyTypes";
import { currencies } from "../features/currency/currencies";
import {
  getForeignCurrencyUnit,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";
import { formatRateCompact } from "../utils/formatMoney";

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
  const foreignUnit = getForeignCurrencyUnit(foreignCurrency);
  const baseFlag = exchangeRate.base === "TWD" ? base.flag : foreignCurrency.flag;
  const targetFlag = exchangeRate.target === "TWD" ? currencies.TWD.flag : foreignCurrency.flag;
  const baseName = exchangeRate.base === "TWD" ? "台幣" : foreignCurrency.name;
  const targetName = exchangeRate.target === "TWD" ? "台幣" : foreignCurrency.name;

  return (
    <header className="currency-header">
      <div>
        <div className="currency-pair">
          <span>{baseFlag}</span>
          <strong>
            {baseName} → {targetFlag} {targetName}
          </strong>
        </div>
        {twdToJpyRate > 0 ? (
          <p>1 台幣 = {formatRateCompact(twdToJpyRate)} {foreignCurrency.name}</p>
        ) : (
          <div className="first-step-hint">
            <span>第一步</span>
            <strong>請輸入今天匯率</strong>
            <p>例如：1 台幣 = 5.0761 {foreignCurrency.name}</p>
          </div>
        )}
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
