import { ChevronDown, ChevronUp, Send, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ExchangeRate } from "../features/currency/currencyTypes";
import { cowRoundTwd } from "../features/rounding/cowRounding";
import { splitBill } from "../features/split/splitBill";
import {
  getForeignCurrencyUnit,
  type ForeignCurrencyDisplay,
} from "../utils/displayCurrency";
import { convertJpyToTwd } from "../utils/fx";
import { formatNumber } from "../utils/formatMoney";
import { cleanNumericInput, toNumber } from "../utils/numberInput";
import { shareText } from "../utils/share";
import { createSplitShareText } from "../utils/shareText";

type SplitPanelProps = {
  exchangeRate: number;
  foreignCurrency: ForeignCurrencyDisplay;
  activeExchangeRate: ExchangeRate;
  total: string;
  people: string;
  itemName: string;
  date: string;
  onTotalChange: (value: string) => void;
  onPeopleChange: (value: string) => void;
  onItemNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
};

export function SplitPanel({
  exchangeRate,
  foreignCurrency,
  activeExchangeRate,
  total,
  people,
  itemName,
  date,
  onTotalChange,
  onPeopleChange,
  onItemNameChange,
  onDateChange,
}: SplitPanelProps) {
  const foreignUnit = getForeignCurrencyUnit(foreignCurrency);
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const totalJpy = toNumber(total);
  const peopleCount = Math.floor(toNumber(people));
  const perPersonJpy = splitBill(totalJpy, peopleCount);
  const totalTwd = cowRoundTwd(convertJpyToTwd(totalJpy, exchangeRate));
  const perPersonTwd = cowRoundTwd(convertJpyToTwd(perPersonJpy, exchangeRate));
  const hasShareResult = totalJpy > 0 && peopleCount > 0 && perPersonJpy > 0 && perPersonTwd > 0;
  const splitShareText = useMemo(
    () =>
      createSplitShareText({
        itemName,
        date,
        foreignCurrencyName: foreignCurrency.name,
        rateBaseName: activeExchangeRate.base === "TWD" ? "台幣" : foreignCurrency.name,
        rateTargetName: activeExchangeRate.target === "TWD" ? "台幣" : foreignCurrency.name,
        displayExchangeRate: activeExchangeRate.rate,
        totalJpy,
        people: peopleCount,
        perPersonJpy,
        exchangeRate,
        perPersonTwd,
      }),
    [
      itemName,
      date,
      foreignCurrency.name,
      activeExchangeRate.base,
      activeExchangeRate.target,
      activeExchangeRate.rate,
      totalJpy,
      peopleCount,
      perPersonJpy,
      exchangeRate,
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
      setStatusMessage("✅ 已複製到剪貼簿，請貼到 LINE、WeChat 或其他 App。");
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
        <span className="panel-title">
          <UsersRound size={18} />
          <h2>費用分攤</h2>
        </span>
        {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {isOpen && (
        <div className="panel-body">
          <label>
            總金額 {foreignUnit}
            <input
              inputMode="decimal"
              value={total}
              placeholder="例如：40000"
              onChange={(event) => onTotalChange(cleanNumericInput(event.target.value))}
            />
          </label>
          <label>
            人數
            <input
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
                <input
                  value={itemName}
                  onChange={(event) => onItemNameChange(event.target.value)}
                  placeholder="晚餐、超市、咖啡、計程車"
                />
              </label>
              <label>
                日期
                <input
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
              <strong>每人約 NT$ {formatNumber(perPersonTwd)}</strong>
              <span>總計約 NT$ {formatNumber(totalTwd)}</span>
            </div>
          )}
          <div className="share-actions" aria-label="費用分攤分享">
            <button type="button" onClick={handleShare} disabled={!hasShareResult}>
              <Send size={16} />
              分享結果
            </button>
          </div>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      )}
    </section>
  );
}
