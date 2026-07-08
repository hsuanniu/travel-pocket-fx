import { useState } from "react";
import { ComparePanel } from "../components/ComparePanel";
import { CurrencyHeader } from "../components/CurrencyHeader";
import { MainConverter } from "../components/MainConverter";
import { RateSheet } from "../components/RateSheet";
import { SplitPanel } from "../components/SplitPanel";
import { HeroHeader } from "../components/ui/HeroHeader";
import { useCalculatorStore } from "../store/calculatorStore";

export function App() {
  const [isRateSheetOpen, setIsRateSheetOpen] = useState(false);
  const calculator = useCalculatorStore();

  return (
    <main className="app-shell">
      <section className="phone-app" aria-label="Travel Smart Calculator">
        <HeroHeader
          title="旅遊算"
          subtitle="Travel Pocket FX"
          icon={<img src="/icons/icon-192.png" alt="" />}
        />

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
          displayExchangeRate={calculator.activeExchangeRate.rate}
          rateStatusMessage={calculator.rateStatusMessage}
          roundedConvertedAmount={calculator.roundedConvertedAmount}
          hasResult={calculator.hasConversionResult}
          onChange={calculator.setAmountInput}
          onClear={calculator.clearAmount}
        />

        <div className="tool-grid">
          <ComparePanel
            exchangeRate={calculator.exchangeRate}
            foreignCurrency={calculator.foreignCurrency}
          />
          <SplitPanel
            exchangeRate={calculator.exchangeRate}
            foreignCurrency={calculator.foreignCurrency}
            activeExchangeRate={calculator.activeExchangeRate}
            total={calculator.splitTotalAmount}
            people={calculator.splitPeople}
            payerName={calculator.splitPayerName}
            itemName={calculator.splitItemName}
            date={calculator.splitDate}
            onTotalChange={calculator.setSplitTotalAmount}
            onPeopleChange={calculator.setSplitPeople}
            onPayerNameChange={calculator.setSplitPayerName}
            onItemNameChange={calculator.setSplitItemName}
            onDateChange={calculator.setSplitDate}
          />
        </div>

        <footer className="app-footer">
          <span>Travel Pocket FX v1.0.0</span>
          <span>最後更新 2026/07/07</span>
        </footer>

        <RateSheet
          isOpen={isRateSheetOpen}
          rateInput={calculator.rateInput}
          foreignCurrency={calculator.foreignCurrency}
          foreignCurrencyCode={calculator.foreignCurrencyCode}
          customForeignCurrencyName={calculator.customForeignCurrencyName}
          activeExchangeRate={calculator.activeExchangeRate}
          rateStatusMessage={calculator.rateStatusMessage}
          onRateChange={calculator.setRateInput}
          onSave={calculator.saveRate}
          onClose={() => setIsRateSheetOpen(false)}
          onRefreshReferenceRate={calculator.refreshReferenceRate}
          onSwapRateDirection={calculator.swapRateDirection}
          onForeignCurrencyChange={calculator.setForeignCurrencyCode}
          onCustomForeignCurrencyNameChange={calculator.setCustomForeignCurrencyName}
        />
      </section>
    </main>
  );
}
