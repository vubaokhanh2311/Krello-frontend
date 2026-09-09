import { useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";

interface UseGoogleLoginProps {
  onSuccess: (credential: string) => void;
}

export function useGoogleLogin({ onSuccess }: UseGoogleLoginProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (initializedRef.current) return;
    if (!window.google || !googleButtonRef.current) return;

    initializedRef.current = true;

    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: (response) => {
          if (response.credential) {
            onSuccessRef.current(response.credential);
          } else {
            notifications.show({
              title: "Lỗi",
              message: "Không nhận được thông tin từ Google",
              color: "red",
            });
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 300,
        text: "signin_with",
        locale: "vi",
      });
    } catch (err) {
      console.error("Google init error:", err);
    }
  }, []);

  return googleButtonRef;
}
