import { NextResponse } from "next/server";
import { normalizeMoodleUrl } from "@/lib/moodle-url";

export async function POST(request: Request) {
  try {
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
