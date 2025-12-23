import { useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";

interface UseGoogleLoginProps {
  onSuccess: (credential: string) => void;
}

export function useGoogleLogin({ onSuccess }: UseGoogleLoginProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
          callback: (response) => {
            if (response.credential) {
              onSuccess(response.credential);
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
          width: googleButtonRef.current.offsetWidth,
          text: "signin_with",
          locale: "vi",
        });
      } catch (err) {
        console.error("Google init error:", err);
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const timer = setTimeout(initGoogle, 500);
      return () => clearTimeout(timer);
    }
  }, [onSuccess]);

  return googleButtonRef;
}
