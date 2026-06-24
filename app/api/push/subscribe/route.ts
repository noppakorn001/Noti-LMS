/**
 * Push Subscription API Route
 *
 * POST — Save a push subscription
 * DELETE — Remove a push subscription
 *
 * Note: This is a simple in-memory store for development.
 * In production, replace with Cloudflare KV, D1, or another
 * persistent storage solution.
 */

// In-memory subscription store (for development / single-instance only)
// For production on Cloudflare Workers, use KV:
//   const KV = env.PUSH_SUBSCRIPTIONS;
//   await KV.put(endpoint, JSON.stringify(subscription));
const subscriptions = new Map<string, PushSubscriptionJSON>();

export async function POST(request: Request) {
  try {
    const subscription = (await request.json()) as PushSubscriptionJSON;

    if (!subscription.endpoint) {
      return Response.json(
        { error: "Missing endpoint in subscription" },
        { status: 400 }
      );
    }

    subscriptions.set(subscription.endpoint, subscription);
    console.log(
      `[Push] Subscription saved. Total: ${subscriptions.size}`,
      subscription.endpoint.slice(0, 60) + "..."
    );

    return Response.json({ success: true, total: subscriptions.size });
  } catch (error) {
    console.error("[Push] Failed to save subscription:", error);
    return Response.json(
      { error: "Invalid subscription data" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { endpoint } = (await request.json()) as { endpoint: string };

    if (!endpoint) {
      return Response.json({ error: "Missing endpoint" }, { status: 400 });
    }

    const deleted = subscriptions.delete(endpoint);
    console.log(
      `[Push] Subscription ${deleted ? "removed" : "not found"}. Total: ${subscriptions.size}`
    );

    return Response.json({ success: true, deleted });
  } catch (error) {
    console.error("[Push] Failed to delete subscription:", error);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

// Export for use by the send route
export { subscriptions };
