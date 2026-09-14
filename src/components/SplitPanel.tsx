import { ChevronDown, ChevronUp, Send, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ExchangeRate } from "../features/currency/currencyTypes";
import { cowRoundTwd } from "../features/rounding/cowRounding";
import { splitBill } from "../features/split/splitBill";
import {
  getForeignCurrencyUnit,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";
import { convertForeignToTwd } from "../utils/fx";
import { formatNumber } from "../utils/formatMoney";
import { cleanNumericInput, toNumber } from "../utils/numberInput";
import { shareText } from "../utils/share";
import { createSplitShareText } from "../utils/shareText";
import { AppButton } from "./ui/AppButton";
import { AppInput } from "./ui/AppInput";
import { SectionTitle } from "./ui/SectionTitle";

type SplitPanelProps = {
  exchangeRate: number;
  foreignCurrency: ForeignCurrencyDisplay;
  activeExchangeRate: ExchangeRate;
  total: string;
  people: string;
  payerName: string;
  itemName: string;
  date: string;
  onTotalChange: (value: string) => void;
  onPeopleChange: (value: string) => void;
  onPayerNameChange: (value: string) => void;
  onItemNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
};

export function SplitPanel({
  exchangeRate,
  foreignCurrency,
  activeExchangeRate,
  total,
  people,
  payerName,
  itemName,
  date,
  onTotalChange,
  onPeopleChange,
  onPayerNameChange,
  onItemNameChange,
  onDateChange,
}: SplitPanelProps) {
  const foreignUnit = getForeignCurrencyUnit(foreignCurrency);
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const totalForeign = toNumber(total);
  const peopleCount = Math.floor(toNumber(people));
  const perPersonForeign = splitBill(totalForeign, peopleCount);
  const hasExchangeRate = exchangeRate > 0;
  const totalTwd = hasExchangeRate ? cowRoundTwd(convertForeignToTwd(totalForeign, exchangeRate)) : 0;
  const perPersonTwd = hasExchangeRate ? cowRoundTwd(convertForeignToTwd(perPersonForeign, exchangeRate)) : 0;
  const hasTwdEstimate = hasExchangeRate && perPersonTwd > 0;
  const payerNameText = payerName.trim();
  const otherPeopleCount = Math.max(peopleCount - 1, 0);
  const hasShareResult = totalForeign > 0 && peopleCount > 0 && perPersonForeign > 0;
  const splitShareText = useMemo(
    () =>
      createSplitShareText({
        itemName,
        payerName,
        date,
        foreignCurrencyName: foreignCurrency.name,
        rateBaseName: activeExchangeRate.base === "TWD" ? "台幣" : foreignCurrency.name,
        rateTargetName: activeExchangeRate.target === "TWD" ? "台幣" : foreignCurrency.name,
        displayExchangeRate: activeExchangeRate.rate,
        totalForeign,
        people: peopleCount,
        perPersonForeign,
        exchangeRate,
        perPersonTwd: hasTwdEstimate ? perPersonTwd : undefined,
      }),
    [
      itemName,
      payerName,
      date,
      foreignCurrency.name,
      activeExchangeRate.base,
      activeExchangeRate.target,
      activeExchangeRate.rate,
      totalForeign,
      peopleCount,
      perPersonForeign,
      exchangeRate,
      hasTwdEstimate,
      perPersonTwd,
    ],
  );

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStatusMessage("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  async function handleShare(): Promise<void> {
    const result = await shareText(splitShareText);

    if (result === "copied") {
      setStatusMessage("✅ 已複製到剪貼簿，請貼到 WeChat 或其他 App。");
    }
  }

  return (
    <section className={`tool-panel accent-gold${isOpen ? "" : " is-collapsed"}`}>
      <button
        className="panel-toggle"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <SectionTitle icon={<UsersRound size={18} />} title="費用分攤" />
        {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {isOpen && (
        <div className="panel-body">
          <label>
            付款人（選填）
            <AppInput
              value={payerName}
              onChange={(event) => onPayerNameChange(event.target.value)}
              placeholder="例如：付款人名稱"
            />
          </label>
          <label>
            總金額 {foreignUnit}
            <AppInput
              inputMode="decimal"
              value={total}
              placeholder="例如：40000"
              onChange={(event) => onTotalChange(cleanNumericInput(event.target.value))}
            />
          </label>
          <label>
            人數
            <AppInput
              inputMode="numeric"
              value={people}
              placeholder="例如：4"
              onChange={(event) => onPeopleChange(cleanNumericInput(event.target.value))}
            />
          </label>
          <button
            className="more-toggle"
            type="button"
            onClick={() => setIsMoreOpen((current) => !current)}
            aria-expanded={isMoreOpen}
          >
            更多選項（選填）
            {isMoreOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {isMoreOpen && (
            <div className="optional-fields">
              <label>
                消費項目
                <AppInput
                  value={itemName}
                  onChange={(event) => onItemNameChange(event.target.value)}
                  placeholder="晚餐、超市、咖啡、計程車"
                />
              </label>
              <label>
                日期
                <AppInput
                  value={date}
                  inputMode="numeric"
                  onChange={(event) => onDateChange(event.target.value)}
                  placeholder="YYYY/MM/DD"
                />
              </label>
            </div>
          )}
          {hasShareResult && (
            <div className="panel-result">
              {payerNameText && peopleCount > 1 ? (
                <>
                  <strong>每人應付：{formatNumber(perPersonForeign)} {foreignUnit}</strong>
                  {hasTwdEstimate ? (
                    <span>約 NT$ {formatNumber(perPersonTwd)}，總計約 NT$ {formatNumber(totalTwd)}</span>
                  ) : (
                    <span>輸入匯率後顯示台幣約略金額</span>
                  )}
                  <div className="payer-summary">
                    <span>{payerNameText}已先支付{formatNumber(totalForeign)} {foreignUnit}</span>
                    <span>其餘{formatNumber(otherPeopleCount)}人各需支付{formatNumber(perPersonForeign)} {foreignUnit}給{payerNameText}。</span>
                  </div>
                </>
              ) : (
                <>
                  <strong>每人：{formatNumber(perPersonForeign)} {foreignUnit}</strong>
                  {hasTwdEstimate ? (
                    <span>約 NT$ {formatNumber(perPersonTwd)}，總計約 NT$ {formatNumber(totalTwd)}</span>
                  ) : (
                    <span>輸入匯率後顯示台幣約略金額</span>
                  )}
                </>
              )}
            </div>
          )}
          <div className="share-actions" aria-label="費用分攤分享">
            <AppButton variant="primary" type="button" onClick={handleShare} disabled={!hasShareResult}>
              <Send size={16} />
              分享結果
            </AppButton>
          </div>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      )}
    </section>
  );
}
