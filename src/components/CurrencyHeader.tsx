import { ArrowLeftRight, Coins } from "lucide-react";
import type { ExchangeRate } from "../features/currency/currencyTypes";
import { currencies } from "../features/currency/currencies";
import { type ForeignCurrencyDisplay } from "../utils/displayCurrency";

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
  const baseFlag = exchangeRate.base === "TWD" ? base.flag : foreignCurrency.flag;
  const targetFlag = exchangeRate.target === "TWD" ? currencies.TWD.flag : foreignCurrency.flag;
  const baseName = exchangeRate.base === "TWD" ? "台幣" : foreignCurrency.name;
  const targetName = exchangeRate.target === "TWD" ? "台幣" : foreignCurrency.name;
  const hasRate = exchangeRate.rate > 0;

  return (
    <header className="currency-header">
      <button
        className="currency-summary-button"
        type="button"
        onClick={onSettingsClick}
        aria-label="更換幣別與匯率設定"
      >
        <div className="currency-pair">
          <span>{baseFlag}</span>
          <strong>
            {baseName} → {targetFlag} {targetName}
          </strong>
        </div>
        {hasRate ? (
          <p>匯率換算</p>
        ) : (
          <div className="first-step-hint">
            <span>第一步</span>
            <strong>請輸入今天匯率</strong>
            <p>例如：1 台幣 = 5.0761 {foreignCurrency.name}</p>
          </div>
        )}
      </button>
      <div className="header-actions">
        <button className="icon-button" type="button" onClick={onSwapClick} aria-label="調換幣別">
          <ArrowLeftRight size={19} />
        </button>
        <button
          className="currency-entry-button"
          type="button"
          onClick={onSettingsClick}
          aria-label="更換幣別與匯率設定"
        >
          <Coins size={18} />
          <span>幣別</span>
        </button>
      </div>
    </header>
  );
}
