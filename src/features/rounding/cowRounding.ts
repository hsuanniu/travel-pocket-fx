export type CowRoundingMode = "nearest" | "up";

export function cowRoundTwd(amount: number, mode: CowRoundingMode = "nearest"): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  if (mode === "up") {
    return Math.ceil(amount);
  }

  return Math.round(amount);
}

export function cowRoundAmount(amount: number, mode: CowRoundingMode = "nearest"): number {
  return cowRoundTwd(amount, mode);
}
