/// Service Worker for Noti LMS Push Notifications

const CACHE_NAME = "noti-lms-v1";

// Install event — pre-cache essential assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate event — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Push event — show notification when a push message arrives
self.addEventListener("push", (event) => {
  let data = { title: "Noti LMS", body: "You have upcoming tasks", url: "/" };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "noti-lms-default",
    renotify: true,
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Open Dashboard" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event — open the app or focus existing window
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if available
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        return clients.openWindow(targetUrl);
      })
  );
});

// Periodic background sync — check for new tasks (Android only, when supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-moodle-tasks") {
    event.waitUntil(checkForNewTasks());
  }
});

async function checkForNewTasks() {
  try {
    const response = await fetch("/api/push/check");
    if (!response.ok) return;
    const data = await response.json();
    if (data.hasNewTasks) {
      await self.registration.showNotification("Noti LMS", {
        body: data.message,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "moodle-check",
        data: { url: "/" },
      });
    }
  } catch {
    // Silently fail — network may be unavailable
  }
}
