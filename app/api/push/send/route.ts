/**
 * Push Send API Route
 *
 * POST/GET — Send personalized push notifications to all subscribed users.
 *
 * This serverless handler queries the Moodle Web Services API for each active subscriber,
 * builds a list of tasks due today or tomorrow, and sends a personalized notification.
 */

import { getSubscriptions, removeSubscription } from "@/lib/push-db";
import { normalizeMoodleUrl } from "@/lib/moodle-url";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { buildPushPayload } from "@block65/webcrypto-web-push";

// Decode HTML entities (duplicate from lib/utils to run inside Serverless Edge/Worker)
function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

// Convert target Date to Bangkok time (UTC+7) components
function getBangkokDateInfo(date: Date) {
  const bangkokOffset = 7 * 60 * 60 * 1000;
  
  const nowInBkk = new Date(Date.now() + bangkokOffset);
  const targetInBkk = new Date(date.getTime() + bangkokOffset);

  const nowYear = nowInBkk.getUTCFullYear();
  const nowMonth = nowInBkk.getUTCMonth();
  const nowDay = nowInBkk.getUTCDate();

  const targetYear = targetInBkk.getUTCFullYear();
  const targetMonth = targetInBkk.getUTCMonth();
  const targetDay = targetInBkk.getUTCDate();

  const isSameDay = nowYear === targetYear && nowMonth === targetMonth && nowDay === targetDay;

  const tomorrowInBkk = new Date(Date.now() + bangkokOffset + 24 * 60 * 60 * 1000);
  const isTomorrow = tomorrowInBkk.getUTCFullYear() === targetYear &&
                     tomorrowInBkk.getUTCMonth() === targetMonth &&
                     tomorrowInBkk.getUTCDate() === targetDay;

  // Format time (h:mm a)
  const hours = targetInBkk.getUTCHours();
  const minutes = targetInBkk.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;

  return { isSameDay, isTomorrow, timeStr };
}

// Perform direct REST Web Service calls to Moodle
async function moodleRequest<T>(
  moodleUrl: string,
  token: string,
  wsfunction: string,
  params: Record<string, any> = {}
): Promise<T> {
  const normalized = normalizeMoodleUrl(moodleUrl);
  const searchParams = new URLSearchParams({
    wstoken: token,
    wsfunction,
    moodlewsrestformat: "json",
  });

  function appendParam(searchParams: URLSearchParams, key: string, value: any) {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => searchParams.append(`${key}[]`, String(entry)));
      return;
    }
    searchParams.append(key, String(value));
  }

  Object.entries(params).forEach(([key, value]) => appendParam(searchParams, key, value));

  const response = await fetch(`${normalized}/webservice/rest/server.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: searchParams.toString(),
  });

  if (!response.ok) {
    throw new Error(`Moodle WebService returned status ${response.status}`);
  }

  const data = await response.json();
  if (data && (data.exception || data.error)) {
    throw new Error(data.message ?? data.error ?? "Moodle WebService error");
  }

  return data as T;
}

// Fetch and enrich assignments & quizzes from Moodle
async function fetchMoodleTasks(
  moodleUrl: string,
  token: string,
  userId: number
): Promise<{ title: string; courseName: string; dueDate: Date; label: "Today" | "Tomorrow" | "Exam" }[]> {
  try {
    // 1. Get courses
    const courses = await moodleRequest<any[]>(moodleUrl, token, "core_enrol_get_users_courses", {
      userid: userId,
    });
    if (!Array.isArray(courses) || courses.length === 0) return [];

    const courseIds = courses.map((c: any) => c.id);
    const courseNames = new Map(
      courses.map((c: any) => [
        c.id,
        decodeHtmlEntities(c.displayname || c.fullname || c.shortname || "Course"),
      ])
    );

    // 2. Fetch assignments
    const assignmentsRes = await moodleRequest<any>(moodleUrl, token, "mod_assign_get_assignments", {
      courseids: courseIds,
    });

    // 3. Fetch quizzes
    const quizzesRes = await moodleRequest<any>(moodleUrl, token, "mod_quiz_get_quizzes_by_courses", {
      courseids: courseIds,
    });

    const tasks: { title: string; courseName: string; dueDate: Date; label: "Today" | "Tomorrow" | "Exam" }[] = [];
    const now = new Date();

    // Parse assignments
    if (assignmentsRes?.courses) {
      for (const course of assignmentsRes.courses) {
        if (!course.assignments) continue;
        for (const assign of course.assignments) {
          if (!assign.duedate) continue;
          const dueDate = new Date(assign.duedate * 1000);
          if (dueDate < now) continue;

          // Check if submitted
          let submitted = false;
          try {
            const status = await moodleRequest<any>(moodleUrl, token, "mod_assign_get_submission_status", {
              assignid: assign.id,
            });
            submitted = status?.lastattempt?.submission?.status === "submitted";
          } catch {}

          if (submitted) continue;

          const courseName = courseNames.get(course.id) || "Course";
          const { isSameDay, isTomorrow } = getBangkokDateInfo(dueDate);

          if (isSameDay) {
            tasks.push({ title: decodeHtmlEntities(assign.name), courseName, dueDate, label: "Today" });
          } else if (isTomorrow) {
            tasks.push({ title: decodeHtmlEntities(assign.name), courseName, dueDate, label: "Tomorrow" });
          }
        }
      }
    }

    // Parse quizzes
    if (quizzesRes?.quizzes) {
      for (const quiz of quizzesRes.quizzes) {
        if (!quiz.timeclose && !quiz.timeopen) continue;
        const dueDate = new Date((quiz.timeclose || quiz.timeopen) * 1000);
        if (dueDate < now) continue;

        const { isSameDay, isTomorrow } = getBangkokDateInfo(dueDate);
        const hoursLeft = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        const courseName = courseNames.get(quiz.course) || "Course";

        if (hoursLeft >= 0 && hoursLeft <= 24) {
          tasks.push({ title: decodeHtmlEntities(quiz.name), courseName, dueDate, label: "Exam" });
        } else if (isSameDay) {
          tasks.push({ title: decodeHtmlEntities(quiz.name), courseName, dueDate, label: "Today" });
        } else if (isTomorrow) {
          tasks.push({ title: decodeHtmlEntities(quiz.name), courseName, dueDate, label: "Tomorrow" });
        }
      }
    }

    // Sort tasks chronologically by due date
    return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  } catch (error) {
    console.error("[Push Send] Failed to fetch Moodle tasks for subscriber:", error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    let defaultTitle = "Noti LMS";
    let defaultBody = "You have upcoming tasks";
    let defaultUrl = "/";

    try {
      const json = (await request.json()) as { title?: string; body?: string; url?: string };
      if (json) {
        if (json.title) defaultTitle = json.title;
        if (json.body) defaultBody = json.body;
        if (json.url) defaultUrl = json.url;
      }
    } catch {
      // Gracefully handle empty triggers (cron-job.org)
    }

    const list = await getSubscriptions();

    if (list.length === 0) {
      return Response.json({ message: "No subscriptions registered" });
    }

    // Dynamically retrieve VAPID keys from Cloudflare bindings or fallback process.env
    const context = (await getCloudflareContext()) as any;
    const VAPID_PUBLIC_KEY =
      context?.env?.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      "BKkCBTXev6dqy1iwUgCLyK0NX4sYKilrT-Ja_M-eF3g7-5FINxqn2nQ6ti8x18-aUg7H254k9h7eFdyTvzKfbnU";
    const VAPID_PRIVATE_KEY =
      context?.env?.VAPID_PRIVATE_KEY ||
      process.env.VAPID_PRIVATE_KEY;

    if (!VAPID_PRIVATE_KEY) {
      console.error("[Push] VAPID_PRIVATE_KEY environment variable is not configured.");
      return Response.json(
        { error: "VAPID private key is not configured on the server." },
        { status: 500 }
      );
    }

    const vapidKeys = {
      subject: "mailto:noti-lms@example.com",
      publicKey: VAPID_PUBLIC_KEY,
      privateKey: VAPID_PRIVATE_KEY,
    };

    const results = await Promise.allSettled(
      list.map(async (sub) => {
        try {
          let userTitle = defaultTitle;
          let userBody = defaultBody;
          let userUrl = defaultUrl;

          // Personalize the push notification content if Moodle integration is active
          if (sub.moodleUrl && sub.moodleToken && sub.moodleUserId) {
            const tasks = await fetchMoodleTasks(sub.moodleUrl, sub.moodleToken, sub.moodleUserId);

            if (tasks.length > 0) {
              userTitle = `🔔 ${tasks.length} Upcoming Tasks`;

              const displayTasks = tasks.slice(0, 3);
              const lines = displayTasks.map(({ title, courseName, dueDate, label }) => {
                const { timeStr } = getBangkokDateInfo(dueDate);
                const course = courseName.length > 15 ? courseName.slice(0, 13) + ".." : courseName;
                return `• [${label}] ${title} (${course} - ${timeStr})`;
              });

              if (tasks.length > 3) {
                lines.push(`... and ${tasks.length - 3} more tasks`);
              }
              userBody = lines.join("\n");
            } else {
              userTitle = "Noti LMS";
              userBody = "🎉 No tasks due today or tomorrow! Enjoy your day.";
            }
          }

          const messageData = JSON.stringify({
            title: userTitle,
            body: userBody,
            url: userUrl,
          });

          // Build encrypted push payload using Native Web Crypto API via @block65/webcrypto-web-push
          const pushPayload = await buildPushPayload(
            {
              data: messageData,
              options: {
                ttl: 60,
              },
            },
            {
              endpoint: sub.endpoint,
              expirationTime: null,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            vapidKeys
          );

          // Send to push service endpoint using standard fetch
          const response = await fetch(sub.endpoint, pushPayload as any);

          if (!response.ok) {
            // Automatically clean up expired subscriptions (410 Gone / 404 Not Found)
            if (response.status === 410 || response.status === 404) {
              await removeSubscription(sub.endpoint);
            }
            throw new Error(`Push service returned status ${response.status}`);
          }

          return { endpoint: sub.endpoint.slice(0, 60), status: "sent" };
        } catch (error: any) {
          console.error(`[Push] Failed to send to subscription ${sub.endpoint.slice(0, 60)}:`, error);
          return {
            endpoint: sub.endpoint.slice(0, 60),
            status: "failed",
            message: error?.message || "Unknown error",
          };
        }
      })
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "sent"
    ).length;

    return Response.json({ success: true, sent, total: list.length });
  } catch (error) {
    console.error("[Push] Send process failed:", error);
    return Response.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
