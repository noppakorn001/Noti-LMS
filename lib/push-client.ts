/**
 * Push notification client utilities.
 *
 * Handles Service Worker registration, push subscription,
 * and provides helpers for sending notifications on mobile.
 */

const VAPID_PUBLIC_KEY =
  "BKkCBTXev6dqy1iwUgCLyK0NX4sYKilrT-Ja_M-eF3g7-5FINxqn2nQ6ti8x18-aUg7H254k9h7eFdyTvzKfbnU";

/**
 * Convert a URL-safe base64 string to a Uint8Array for applicationServerKey.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if push notifications are supported in this environment.
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Check if the app is running as an installed PWA (standalone mode).
 */
export function isInstalledPWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error — iOS Safari standalone property
    window.navigator.standalone === true
  );
}

/**
 * Register the service worker if not already registered.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    console.log("[Noti LMS] Service Worker registered:", registration.scope);

    // Try to register periodic background sync (Android only)
    try {
      // @ts-expect-error — periodicSync is not yet in all TS definitions
      if (registration.periodicSync) {
        // @ts-expect-error
        await registration.periodicSync.register("check-moodle-tasks", {
          minInterval: 60 * 60 * 1000, // 1 hour minimum
        });
        console.log("[Noti LMS] Periodic background sync registered");
      }
    } catch {
      // Periodic sync not supported or permission denied — that's OK
    }

    return registration;
  } catch (error) {
    console.error("[Noti LMS] Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Subscribe to push notifications.
 * Returns the PushSubscription or null if it fails.
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    // Check existing subscription first
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      console.log("[Noti LMS] Already subscribed to push");
      await saveSubscription(existing);
      return existing;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    console.log("[Noti LMS] Push subscription created");
    await saveSubscription(subscription);
    return subscription;
  } catch (error) {
    console.error("[Noti LMS] Push subscription failed:", error);
    return null;
  }
}

/**
 * Save the push subscription to the backend.
 */
async function saveSubscription(subscription: PushSubscription): Promise<void> {
  try {
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });
    console.log("[Noti LMS] Subscription saved to server");
  } catch (error) {
    console.error("[Noti LMS] Failed to save subscription:", error);
  }
}

/**
 * Unsubscribe from push notifications.
 */
export async function unsubscribeFromPush(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      // Notify server
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      console.log("[Noti LMS] Unsubscribed from push");
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Noti LMS] Unsubscribe failed:", error);
    return false;
  }
}

/**
 * Show a local notification via the Service Worker.
 * This is the correct method for mobile devices (especially iOS).
 */
export async function showLocalNotification(
  title: string,
  body: string,
  options?: { tag?: string; url?: string }
): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: options?.tag || "noti-lms-local",
      data: { url: options?.url || "/" },
    });
  } catch (error) {
    console.warn("[Noti LMS] showLocalNotification failed:", error);
  }
}
