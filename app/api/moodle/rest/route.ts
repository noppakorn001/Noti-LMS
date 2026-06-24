import { NextResponse } from "next/server";
import { normalizeMoodleUrl } from "@/lib/moodle-url";

type ParamValue = string | number | boolean | null | undefined | Array<string | number | boolean>;

function appendParam(params: URLSearchParams, key: string, value: ParamValue) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach((entry) => params.append(`${key}[]`, String(entry)));
    return;
  }

  params.append(key, String(value));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const moodleUrl = normalizeMoodleUrl(body.moodleUrl);
    const token = String(body.token ?? "");
    const wsfunction = String(body.wsfunction ?? "");
    const inputParams = (body.params ?? {}) as Record<string, ParamValue>;

    if (!moodleUrl || !token || !wsfunction) {
      return NextResponse.json({ error: "Moodle URL, token, and function are required." }, { status: 400 });
    }

    const params = new URLSearchParams({
      wstoken: token,
      wsfunction,
      moodlewsrestformat: "json",
    });

    Object.entries(inputParams).forEach(([key, value]) => appendParam(params, key, value));

    const response = await fetch(`${moodleUrl}/webservice/rest/server.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: "Moodle API request failed.", details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Moodle API request failed." },
      { status: 500 },
    );
  }
}
