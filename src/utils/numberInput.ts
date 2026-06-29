export function cleanNumericInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [integerPart, ...decimalParts] = cleaned.split(".");

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join("")}`;
}

export function toNumber(value: string): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}
