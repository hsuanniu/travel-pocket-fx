import { ArrowLeftRight, Coins } from "lucide-react";
import type { ExchangeRate } from "../features/currency/currencyTypes";

import { type ForeignCurrencyDisplay } from "../utils/displayCurrency";

type CurrencyHeaderProps = {
  exchangeRate: ExchangeRate;

  sourceCurrency: ForeignCurrencyDisplay;
  targetCurrency: ForeignCurrencyDisplay;
  onSwapClick: () => void;
  onSettingsClick: () => void;
};

export function CurrencyHeader({
  exchangeRate,

  sourceCurrency,
  targetCurrency,
  onSwapClick,
  onSettingsClick,
}: CurrencyHeaderProps) {
  const baseFlag = sourceCurrency.flag;
  const targetFlag = targetCurrency.flag;
  const baseName = sourceCurrency.name;
  const targetName = targetCurrency.name;
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
            <p>1 {baseName} = ? {targetName}</p>
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
