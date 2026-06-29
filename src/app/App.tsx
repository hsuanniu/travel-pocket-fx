import { useState } from "react";
import { ComparePanel } from "../components/ComparePanel";
import { CurrencyHeader } from "../components/CurrencyHeader";
import { MainConverter } from "../components/MainConverter";
import { QuickAmountGrid } from "../components/QuickAmountGrid";
import { RateSheet } from "../components/RateSheet";
import { SplitPanel } from "../components/SplitPanel";
import { useCalculatorStore } from "../store/calculatorStore";

export function App() {
  const [isRateSheetOpen, setIsRateSheetOpen] = useState(false);
  const calculator = useCalculatorStore();

  return (
    <main className="app-shell">
      <section className="phone-app" aria-label="Travel Smart Calculator">
        <CurrencyHeader
          exchangeRate={calculator.activeExchangeRate}
          twdToJpyRate={calculator.exchangeRate}
          foreignCurrency={calculator.foreignCurrency}
          onSwapClick={calculator.swapDirection}
          onSettingsClick={() => setIsRateSheetOpen(true)}
        />

        <MainConverter
          amountInput={calculator.amountInput}
          baseCurrency={calculator.activeExchangeRate.base}
          targetCurrency={calculator.activeExchangeRate.target}
          foreignCurrency={calculator.foreignCurrency}
          roundedConvertedAmount={calculator.roundedConvertedAmount}
          onChange={calculator.setAmountInput}
          onClear={calculator.clearAmount}
        />

        <QuickAmountGrid onPick={calculator.setAmountInput} />

        <div className="tool-grid">
          <ComparePanel
            exchangeRate={calculator.exchangeRate}
            foreignCurrency={calculator.foreignCurrency}
          />
          <SplitPanel
            exchangeRate={calculator.exchangeRate}
            foreignCurrency={calculator.foreignCurrency}
          />
        </div>

        <RateSheet
          isOpen={isRateSheetOpen}
          rateInput={calculator.rateInput}
          foreignCurrency={calculator.foreignCurrency}
          foreignCurrencyCode={calculator.foreignCurrencyCode}
          customForeignCurrencyName={calculator.customForeignCurrencyName}
          onRateChange={calculator.setRateInput}
          onSave={calculator.saveRate}
          onClose={() => setIsRateSheetOpen(false)}
          onForeignCurrencyChange={calculator.setForeignCurrencyCode}
          onCustomForeignCurrencyNameChange={calculator.setCustomForeignCurrencyName}
        />
      </section>
    </main>
  );
}
