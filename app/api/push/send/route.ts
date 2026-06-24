/**
 * Push Send API Route
 *
 * POST — Send a push notification to all subscribed users.
 *
 * Note: The `web-push` library is used for VAPID-based push.
 * For Cloudflare Workers in production, you may need to use
 * the Web Push protocol directly via fetch(), since `web-push`
 * depends on Node.js crypto APIs.
 */

import { subscriptions } from "../subscribe/route";

const VAPID_PUBLIC_KEY =
  "BKkCBTXev6dqy1iwUgCLyK0NX4sYKilrT-Ja_M-eF3g7-5FINxqn2nQ6ti8x18-aUg7H254k9h7eFdyTvzKfbnU";
const VAPID_PRIVATE_KEY = "VTlg1O7zJ_ZDMI7rimFgEftZTAT55uFuMaA7m0KwVyc";

export async function POST(request: Request) {
  try {
    const { title, body, url } = (await request.json()) as {
      title?: string;
      body?: string;
      url?: string;
    };

    if (subscriptions.size === 0) {
      return Response.json(
        { error: "No subscriptions registered" },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
      title: title || "Noti LMS",
      body: body || "You have upcoming tasks",
      url: url || "/",
    });

    // Note: In a Node.js environment (local dev), you can use the web-push library.
    // On Cloudflare Workers, implement the Web Push protocol manually or
    // use a third-party push service.
    //
    // For local development, we dynamically import web-push:
    let webpush;
    try {
      webpush = await import("web-push");
    } catch {
      // web-push not installed — return instructions
      return Response.json(
        {
          error:
            "web-push library not installed. Run: npm install web-push",
          subscriptionCount: subscriptions.size,
          note: "For Cloudflare Workers, implement Web Push protocol directly.",
        },
        { status: 501 }
      );
    }

    webpush.setVapidDetails(
      "mailto:noti-lms@example.com",
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    const results = await Promise.allSettled(
      [...subscriptions.entries()].map(async ([endpoint, sub]) => {
        try {
          await webpush!.sendNotification(sub as never, payload);
          return { endpoint: endpoint.slice(0, 60), status: "sent" };
        } catch (error: unknown) {
          const statusCode =
            error && typeof error === "object" && "statusCode" in error
              ? (error as { statusCode: number }).statusCode
              : 0;
          // Remove invalid subscriptions (410 Gone, 404 Not Found)
          if (statusCode === 410 || statusCode === 404) {
            subscriptions.delete(endpoint);
          }
          return {
            endpoint: endpoint.slice(0, 60),
            status: "failed",
            code: statusCode,
          };
        }
      })
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "sent"
    ).length;

    return Response.json({ success: true, sent, total: subscriptions.size });
  } catch (error) {
    console.error("[Push] Send failed:", error);
    return Response.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
