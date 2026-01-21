import { useEffect } from "react";
import { useUserStore } from "../stores/userStore";
import RestClient from "../api/RestClient";
import { getUserProfile } from "../api/authService";

interface Props {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: Props) {
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);

  useEffect(() => {
    const accessToken =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");

    if (!accessToken) return;

    RestClient["client"].defaults.headers.common.Authorization =
      `Bearer ${accessToken}`;

    getUserProfile()
      .then((profile) => {
        setUser(profile, accessToken, null);
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        clearUser();
      });
  }, [setUser, clearUser]);

  return <>{children}</>;
}
