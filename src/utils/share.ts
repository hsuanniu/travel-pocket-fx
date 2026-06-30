import { copyToClipboard } from "./clipboard";

export type ShareResult = "shared" | "copied" | "cancelled";

export async function shareText(text: string): Promise<ShareResult> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        text,
      });
      return "shared";
    } catch {
      await copyToClipboard(text);
      return "copied";
    }
  }

  await copyToClipboard(text);
  return "copied";
}
