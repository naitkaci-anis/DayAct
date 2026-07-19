// DayAct service worker — enables installation (PWA) and notification display
// on mobile (Android requires ServiceWorkerRegistration.showNotification).
// Intentionally NO fetch caching: the app always loads the latest deploy.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Tapping a notification focuses the app (or opens it).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if ("focus" in client) return client.focus();
        }
        return self.clients.openWindow("/dashboard");
      })
  );
});
