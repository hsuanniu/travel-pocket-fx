import { copyToClipboard } from "./clipboard";

export type ShareResult = "shared" | "copied" | "cancelled";

export async function shareText(text: string): Promise<ShareResult> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        text,
        title: "費用分攤",
      });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  await copyToClipboard(text);
  return "copied";
}
