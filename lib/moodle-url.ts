const ALLOWED_MOODLE_HOSTS = new Set([
  "lms.psu.ac.th",
]);

export function normalizeMoodleUrl(value: unknown): string {
  if (typeof value !== "string") return "";

  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);

    // Enforce HTTPS
    if (url.protocol !== "https:") return "";

    // Block private/local hostnames
    if (isPrivateHost(url.hostname)) return "";

    // Restrict to allowed domains
    if (!ALLOWED_MOODLE_HOSTS.has(url.hostname)) return "";

    return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return "";
  }
}

function isPrivateHost(hostname: string): boolean {
  const blocked = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\./,
    /^\[::1\]$/,
    /^\[fc/i,
    /^\[fd/i,
    /^\[fe80/i,
  ];
  return blocked.some((pattern) => pattern.test(hostname));
}
