import { NextResponse } from "next/server";
import { normalizeMoodleUrl } from "@/lib/moodle-url";

const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed, retryAfterMs } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again in 15 minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }

    const body = await request.json();
    const moodleUrl = normalizeMoodleUrl(body.moodleUrl);
    const username = String(body.username ?? "");
    const password = String(body.password ?? "");

    if (!moodleUrl || !username || !password) {
      return NextResponse.json({ error: "Moodle URL, username, and password are required." }, { status: 400 });
    }

    const params = new URLSearchParams({
      username,
      password,
      service: "moodle_mobile_app",
    });

    const response = await fetch(`${moodleUrl}/login/token.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data || data.error || !data.token) {
      return NextResponse.json(
        { error: data?.error ?? "Unable to authenticate with Moodle." },
        { status: response.ok ? 401 : response.status },
      );
    }

    return NextResponse.json({ token: data.token, moodleUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication failed." },
      { status: 500 },
    );
  }
}
