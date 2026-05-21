import { getToken, onMessage } from "firebase/messaging";
import { saveFCMToken } from "../store/auth-slice";
import { store } from "../store/store";
import { messaging } from "../firebase/firebase";


export const initializeNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") return;

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    await navigator.serviceWorker.ready;

    console.log("SW Registered:", registration);

    const token = await getToken(messaging, {
      vapidKey:
        "BAgurje8t2FopnQ3S5C58wi3jcAwopDYovl1aVxzjzG8Ml8ltxeG_sXDFD9glbZm-NPuZqrs5R3J_S8PpancbKQ",
      serviceWorkerRegistration: registration,
    });

    console.log("FCM TOKEN:", token);

    if (!token) return;

    await store.dispatch(saveFCMToken(token));

    onMessage(messaging, (payload) => {
      console.log("Foreground notification:", payload);

      new Notification(payload.data.title, {
        body: payload.data.body,
        icon: "/Logo.svg",
      });
    });
  } catch (error) {
    console.error("Notification initialization error:", error);
  }
};