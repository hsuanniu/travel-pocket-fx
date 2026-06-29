type QuickAmountGridProps = {
  onPick: (value: string) => void;
};

const quickAmounts = ["100", "500", "1000", "3000", "5000", "10000", "30000", "50000"];

export function QuickAmountGrid({ onPick }: QuickAmountGridProps) {
  return (
    <div className="quick-grid" aria-label="快速金額">
      {quickAmounts.map((amount) => (
        <button key={amount} type="button" onClick={() => onPick(amount)}>
          {Number(amount).toLocaleString("zh-TW")}
        </button>
      ))}
    </div>
  );
}
