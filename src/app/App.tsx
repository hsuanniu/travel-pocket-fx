import { useState } from "react";
import { Calculator, Home, PanelsTopLeft } from "lucide-react";
import { ComparePanel } from "../components/ComparePanel";
import { CurrencyHeader } from "../components/CurrencyHeader";
import { MainConverter } from "../components/MainConverter";
import { RateSheet } from "../components/RateSheet";
import { SplitPanel } from "../components/SplitPanel";
import { BottomNavigation } from "../components/ui/BottomNavigation";
import { HeroHeader } from "../components/ui/HeroHeader";
import { useCalculatorStore } from "../store/calculatorStore";

export function App() {
  const [isRateSheetOpen, setIsRateSheetOpen] = useState(false);
  const calculator = useCalculatorStore();

  return (
    <main className="app-shell">
      <section className="phone-app" aria-label="Travel Smart Calculator">
        <HeroHeader
          eyebrow="TRAVEL POCKET FX"
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
            itemName={calculator.splitItemName}
            date={calculator.splitDate}
            onTotalChange={calculator.setSplitTotalAmount}
            onPeopleChange={calculator.setSplitPeople}
            onItemNameChange={calculator.setSplitItemName}
            onDateChange={calculator.setSplitDate}
          />
        </div>

        <BottomNavigation
          items={[
            { label: "首頁", icon: <Home size={20} />, active: true },
            { label: "換算", icon: <Calculator size={20} /> },
            { label: "工具", icon: <PanelsTopLeft size={20} /> },
          ]}
        />

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
