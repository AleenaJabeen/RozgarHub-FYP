importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyALxG310NTJfI99xBD3xPaFY4VM5mGCh94",
  authDomain: "rozgarhub-46a91.firebaseapp.com",
  projectId: "rozgarhub-46a91",
  messagingSenderId: "295110853975",
  appId: "1:295110853975:web:3505b425cd99731f086a12",
});

const messaging = firebase.messaging();

// background notifications
self.addEventListener("push", (event) => {
  console.log("Push Event:", event);

  if (!event.data) return;

  const payload = event.data.json();

  console.log("Push Payload:", payload);

  const title = payload.data?.title || "RozgarHub";
  const body = payload.data?.body || "New Notification";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/Logo.svg",
      badge: "/Logo.svg",
      data: payload.data,
    }),
  );
});

// notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(`/notifications`));
});
