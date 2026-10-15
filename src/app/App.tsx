import { useState } from "react";
import { ComparePanel } from "../components/ComparePanel";
import { CurrencyHeader } from "../components/CurrencyHeader";
import { MainConverter } from "../components/MainConverter";
import { RateSheet } from "../components/RateSheet";
import { SplitPanel } from "../components/SplitPanel";
import { HeroHeader } from "../components/ui/HeroHeader";
import { useCalculatorStore } from "../store/calculatorStore";
import { appMeta } from "./appMeta";

export function App() {
  const [isRateSheetOpen, setIsRateSheetOpen] = useState(false);
  const calculator = useCalculatorStore();

  return (
    <main className="app-shell">
      <section className="phone-app" aria-label={`${appMeta.name} / ${appMeta.subtitle}`}>
        <HeroHeader
          title={appMeta.name}
          subtitle={appMeta.subtitle}
          icon={<img src="/icons/icon-192.png" alt="" />}
        />

        <CurrencyHeader
          exchangeRate={calculator.activeExchangeRate}
          sourceCurrency={calculator.sourceCurrency}
          targetCurrency={calculator.targetCurrency}
          onSwapClick={calculator.swapDirection}
          onSettingsClick={() => setIsRateSheetOpen(true)}
        />

        <MainConverter
          amountInput={calculator.amountInput}
          baseCurrency={calculator.activeExchangeRate.base}
          targetCurrency={calculator.activeExchangeRate.target}
          sourceCurrency={calculator.sourceCurrency}
          targetDisplay={calculator.targetCurrency}
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
            sourceCurrency={calculator.sourceCurrency}
            targetCurrency={calculator.targetCurrency}
          />
          <SplitPanel
            exchangeRate={calculator.splitRate}
            sourceCurrency={calculator.splitSourceCurrency}
            targetCurrency={calculator.splitTargetCurrency}
            activeExchangeRate={calculator.splitExchangeRate}
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
          <span>{appMeta.subtitle} v{appMeta.version}</span>
          <span>最後更新 {appMeta.lastUpdated}</span>
        </footer>

        <RateSheet
          isOpen={isRateSheetOpen}
          rateInput={calculator.rateInput}
          sourceCurrency={calculator.sourceCurrency}
          targetCurrency={calculator.targetCurrency}
          customForeignCurrencyName={calculator.customForeignCurrencyName}
          activeExchangeRate={calculator.activeExchangeRate}
          rateStatusMessage={calculator.rateStatusMessage}
          onRateChange={calculator.setRateInput}
          onSave={calculator.saveRate}
          onClose={() => setIsRateSheetOpen(false)}
          onRefreshReferenceRate={calculator.refreshReferenceRate}
          onSwapRateDirection={calculator.swapRateDirection}
          onFromCurrencyChange={calculator.setFromCurrency}
          onToCurrencyChange={calculator.setToCurrency}
          onCustomForeignCurrencyNameChange={calculator.setCustomForeignCurrencyName}
        />
      </section>
    </main>
  );
}
