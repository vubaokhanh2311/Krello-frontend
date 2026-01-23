import { Navigate, useLocation } from "react-router-dom";
import { type ReactNode, useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import RestClient from "../api/RestClient";
import { saveRedirectPath } from "../utils/redirectHelper";

interface Props {
  children: ReactNode;
}

const RequireAuth = ({ children }: Props) => {
  const token = RestClient.getToken();
  const refreshToken = RestClient.getRefreshToken();
  const location = useLocation();
  const hasNotified = useRef(false);

  const isAuthenticated = Boolean(token && refreshToken);

  useEffect(() => {
    if (!isAuthenticated && !hasNotified.current) {
      notifications.show({
        title: "Yêu cầu đăng nhập",
        message: "Vui lòng đăng nhập để truy cập trang này!",
        color: "yellow",
        autoClose: 3000,
      });
      hasNotified.current = true;
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    const currentPath = location.pathname + location.search;
    if (currentPath !== "/login") {
      saveRedirectPath(currentPath);
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
