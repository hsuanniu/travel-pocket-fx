export function getLocalSplitDate(now = new Date()): string {
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
}

export function resolveSplitDate(date: string, mode?: "auto" | "manual", now = new Date()): string {
  return mode === "manual" ? date : getLocalSplitDate(now);
}
