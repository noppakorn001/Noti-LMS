import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  // Moodle session for personalized notifications (token only, no password)
  moodleUrl?: string;
  moodleToken?: string;
  moodleUserId?: number;
}

// Fallback in-memory map for local development
const memorySubscriptions = new Map<string, PushSubscriptionJSON>();

async function getKV(): Promise<any> {
  try {
    const context = (await getCloudflareContext()) as any;
    if (context && context.env && context.env.NOTI_LMS_KV) {
      return context.env.NOTI_LMS_KV;
    }
  } catch (error) {
    // Falls back to memory in local dev
  }
  return null;
}

export async function getSubscriptions(): Promise<PushSubscriptionJSON[]> {
  const kv = await getKV();
  if (!kv) {
    return Array.from(memorySubscriptions.values());
  }
  const data = await kv.get("subscriptions_list");
  if (!data) return [];
  try {
    return JSON.parse(data) as PushSubscriptionJSON[];
  } catch {
    return [];
  }
}

export async function addSubscription(sub: PushSubscriptionJSON): Promise<void> {
  const kv = await getKV();
  if (!kv) {
    memorySubscriptions.set(sub.endpoint, sub);
    return;
  }
  const list = await getSubscriptions();
  const filtered = list.filter(item => item.endpoint !== sub.endpoint);
  filtered.push(sub);
  await kv.put("subscriptions_list", JSON.stringify(filtered));
}

export async function removeSubscription(endpoint: string): Promise<boolean> {
  const kv = await getKV();
  if (!kv) {
    return memorySubscriptions.delete(endpoint);
  }
  const list = await getSubscriptions();
  const initialLength = list.length;
  const filtered = list.filter(item => item.endpoint !== endpoint);
  if (filtered.length !== initialLength) {
    await kv.put("subscriptions_list", JSON.stringify(filtered));
    return true;
  }
  return false;
}
