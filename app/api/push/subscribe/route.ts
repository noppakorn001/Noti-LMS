import { NextResponse } from "next/server";
import { addSubscription, removeSubscription, getSubscriptions, type PushSubscriptionJSON } from "@/lib/push-db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PushSubscriptionJSON & {
      moodleUrl?: string;
      moodleToken?: string;
      moodleUserId?: number;
    };

    if (!body.endpoint) {
      return NextResponse.json(
        { error: "Missing endpoint in subscription" },
        { status: 400 }
      );
    }

    // Build subscription object with optional Moodle session
    const subscription: PushSubscriptionJSON = {
      endpoint: body.endpoint,
      keys: body.keys,
    };

    // Attach Moodle credentials if provided (token only, never passwords)
    if (body.moodleUrl) subscription.moodleUrl = body.moodleUrl;
    if (body.moodleToken) subscription.moodleToken = body.moodleToken;
    if (body.moodleUserId) subscription.moodleUserId = body.moodleUserId;

    await addSubscription(subscription);
    const list = await getSubscriptions();

    console.log(`[Push] Subscription saved (moodle: ${!!body.moodleToken}). Total: ${list.length}`);
    return NextResponse.json({ success: true, total: list.length });
  } catch (error) {
    console.error("[Push] Failed to save subscription:", error);
    return NextResponse.json(
      { error: "Invalid subscription data" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { endpoint } = (await request.json()) as { endpoint: string };

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    const deleted = await removeSubscription(endpoint);
    const list = await getSubscriptions();
    
    console.log(
      `[Push] Subscription ${deleted ? "removed" : "not found"}. Total: ${list.length}`
    );

    return NextResponse.json({ success: true, deleted, total: list.length });
  } catch (error) {
    console.error("[Push] Failed to delete subscription:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
