import { useEffect, useRef } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "../firebase/firebase";
import { notifications } from "@mantine/notifications";
import RestClient from "../api/RestClient";
import { syncFcmToken } from "../api/profileService";

const PERMISSION_KEY = "fcm_permission_requested";
const FCM_TOKEN_KEY = "fcm_token";

export const useFirebaseNotification = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize notifications for authenticated users
    const authToken = RestClient.getToken();
    if (!authToken) return;

    if (isInitialized.current) return;
    isInitialized.current = true;

    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      if (!("Notification" in window)) return;

      if (
        Notification.permission === "default" &&
        !localStorage.getItem(PERMISSION_KEY)
      ) {
        localStorage.setItem(PERMISSION_KEY, "1");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
      }

      if (Notification.permission !== "granted") return;

      try {
        const messaging = getMessaging(firebaseApp);

        // Dynamically register service worker passing env variables via query params
        const swUrl = `/firebase-messaging-sw.js?apiKey=${encodeURIComponent(import.meta.env.VITE_FIREBASE_API_KEY || "")}&authDomain=${encodeURIComponent(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "")}&projectId=${encodeURIComponent(import.meta.env.VITE_FIREBASE_PROJECT_ID || "")}&messagingSenderId=${encodeURIComponent(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "")}&appId=${encodeURIComponent(import.meta.env.VITE_FIREBASE_APP_ID || "")}`;

        let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
        if ("serviceWorker" in navigator) {
          serviceWorkerRegistration = await navigator.serviceWorker.register(swUrl);
        }

        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration,
        });

        if (token) {
          const savedToken = localStorage.getItem(FCM_TOKEN_KEY);
          localStorage.setItem(FCM_TOKEN_KEY, token);

          // Automatically sync token with backend if changed or new session
          if (savedToken !== token || !savedToken) {
            await syncFcmToken(token).catch((err) => {
              console.warn("Failed to sync FCM token with server:", err);
            });
          }
        }

        unsubscribe = onMessage(messaging, (payload) => {
          notifications.show({
            title: payload.notification?.title ?? "Thông báo",
            message: payload.notification?.body ?? "",
            color: "blue",
            autoClose: 5000,
          });
        });
      } catch (error) {
        console.error("FCM Notification error:", error);
      }
    };

    init();

    return () => {
      unsubscribe?.();
    };
  }, []);
};

