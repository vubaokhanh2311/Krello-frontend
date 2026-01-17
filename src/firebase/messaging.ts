import {
  getMessaging,
  getToken,
  onMessage,
  type MessagePayload,
} from "firebase/messaging";
import { firebaseApp } from "./firebase";

export const messaging = getMessaging(firebaseApp);

export async function requestFcmToken(): Promise<string | null> {
  const permission: NotificationPermission =
    await Notification.requestPermission();

  if (permission !== "granted") {
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
    });

    return token ?? null;
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
}

export function onForegroundMessage(
  cb: (payload: MessagePayload) => void
): void {
  onMessage(messaging, cb);
}
