export type PriceComparison = {
  difference: number;
  cheaperMarket: "japan" | "taiwan" | "same" | "empty";
  savingPercent: number;
};

export function comparePrices(japanTwdPrice: number, taiwanPrice: number): PriceComparison {
  if (japanTwdPrice <= 0 || taiwanPrice <= 0) {
    return {
      difference: 0,
      cheaperMarket: "empty",
      savingPercent: 0,
    };
  }

  const difference = Math.abs(japanTwdPrice - taiwanPrice);

  if (difference < 1) {
    return {
      difference: 0,
      cheaperMarket: "same",
      savingPercent: 0,
    };
  }

  const cheaperMarket = japanTwdPrice < taiwanPrice ? "japan" : "taiwan";
  const higherPrice = Math.max(japanTwdPrice, taiwanPrice);

  return {
    difference,
    cheaperMarket,
    savingPercent: higherPrice > 0 ? (difference / higherPrice) * 100 : 0,
  };
}
