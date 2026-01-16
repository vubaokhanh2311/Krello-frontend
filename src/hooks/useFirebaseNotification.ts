import { useEffect, useRef } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "../firebase/firebase";

import { notifications } from "@mantine/notifications";

const PERMISSION_KEY = "fcm_permission_requested";
const FCM_TOKEN_KEY = "fcm_token";

export const useFirebaseNotification = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
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

      const messaging = getMessaging(firebaseApp);

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        const savedToken = localStorage.getItem(FCM_TOKEN_KEY);

        if (savedToken !== token) {
          localStorage.setItem(FCM_TOKEN_KEY, token);
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
    };

    init();

    return () => {
      unsubscribe?.();
    };
  }, []);
};
