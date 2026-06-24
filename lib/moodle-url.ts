export function normalizeMoodleUrl(value: unknown) {
  if (typeof value !== "string") return "";

  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return "";
  }
}
