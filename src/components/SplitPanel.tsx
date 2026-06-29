import { ChevronDown, ChevronUp, Send, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
};

export function SplitPanel({ exchangeRate, foreignCurrency }: SplitPanelProps) {
  const foreignUnit = getForeignCurrencyUnit(foreignCurrency);
  const [total, setTotal] = useState("3980");
  const [people, setPeople] = useState("4");
  const [itemName, setItemName] = useState("");
  const [date, setDate] = useState(() => getTodayInputValue());
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
      setStatusMessage("✅ 已複製到剪貼簿，請貼到 LINE 或其他 App。");
    }
  }

  return (
    <section className="tool-panel accent-gold">
      <div className="panel-title">
        <UsersRound size={18} />
        <h2>費用分攤</h2>
      </div>
      <label>
        總金額 {foreignUnit}
        <input
          inputMode="decimal"
          value={total}
          onChange={(event) => setTotal(cleanNumericInput(event.target.value))}
        />
      </label>
      <label>
        人數
        <input
          inputMode="numeric"
          value={people}
          onChange={(event) => setPeople(cleanNumericInput(event.target.value))}
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
              onChange={(event) => setItemName(event.target.value)}
              placeholder="晚餐、超市、咖啡、計程車"
            />
          </label>
          <label>
            日期
            <input value={date} type="date" onChange={(event) => setDate(event.target.value)} />
          </label>
        </div>
      )}
      <div className="panel-result">
        <strong>每人約 NT$ {formatNumber(perPersonTwd)}</strong>
        <span>總計約 NT$ {formatNumber(totalTwd)}</span>
      </div>
      <div className="share-actions" aria-label="費用分攤分享">
        <button type="button" onClick={handleShare} disabled={!hasShareResult}>
          <Send size={16} />
          分享結果
        </button>
      </div>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </section>
  );
}

function getTodayInputValue(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
