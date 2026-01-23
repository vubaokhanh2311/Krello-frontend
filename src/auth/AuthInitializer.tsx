import { useEffect, useState } from "react";
import { useUserStore } from "../stores/userStore";
import RestClient from "../api/RestClient";
import { getUserProfile } from "../api/authService";

interface Props {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: Props) {
  const [isInitialized, setIsInitialized] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = RestClient.getToken();
        const refreshToken = RestClient.getRefreshToken();

        if (!accessToken || !refreshToken) {
          setIsInitialized(true);
          return;
        }

        RestClient["client"].defaults.headers.common.Authorization =
          `Bearer ${accessToken}`;

        const profile = await getUserProfile();

        setUser(profile, accessToken, refreshToken);

        console.log("Auth initialized successfully");
      } catch (error) {
        console.error("Auth initialization failed:", error);

        RestClient.clearTokens();
        clearUser();
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [setUser, clearUser]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-600">Đang khởi tạo...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
