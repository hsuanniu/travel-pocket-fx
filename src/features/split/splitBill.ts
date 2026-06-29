export function splitBill(total: number, people: number): number {
  if (!Number.isFinite(total) || !Number.isFinite(people) || total <= 0 || people <= 0) {
    return 0;
  }

  return total / Math.floor(people);
}
