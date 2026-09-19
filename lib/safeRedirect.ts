/** Only allow same-site paths like "/cart" — never "https://evil.com" or "//evil.com" */
export function safeRedirectPath(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  let path = value;
  try {
    path = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : fallback;
}
