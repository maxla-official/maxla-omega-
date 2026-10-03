/**
 * Robust clipboard utility that works reliably inside iframes and sandboxed environments.
 * Prevents unhandled promise rejections by catching NotAllowedError, DOMException,
 * and falling back to execCommand('copy') gracefully.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Attempt standard modern Clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Failed due to iframe permission or document focus restriction; fallback below
    }
  }

  // Fallback: document.execCommand('copy') with hidden textarea
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.style.opacity = "0";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    textArea.remove();
    return successful;
  } catch (err) {
    console.warn("Clipboard copy failed gracefully:", err);
    return false;
  }
}
