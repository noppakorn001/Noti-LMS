import type { MoodleSession } from "@/lib/types";

export async function moodleCall<T>(
  session: Pick<MoodleSession, "moodleUrl" | "token">,
  wsfunction: string,
  params: Record<string, string | number | boolean | Array<string | number | boolean> | null | undefined> = {},
) {
  const response = await fetch("/api/moodle/rest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      moodleUrl: session.moodleUrl,
      token: session.token,
      wsfunction,
      params,
    }),
  });

  const data = await response.json();

  if (!response.ok || data?.exception || data?.error) {
    throw new Error(data?.message ?? data?.error ?? "Moodle request failed.");
  }

  return data as T;
}
