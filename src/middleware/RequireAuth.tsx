import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { notifications } from "@mantine/notifications";

interface Props {
  children: ReactNode;
}

const RequireAuth = ({ children }: Props) => {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!token && !showNotification) {
      notifications.show({
        title: "Cần đăng nhập",
        message: "Vui lòng đăng nhập để truy cập trang này!",
        color: "yellow",
        autoClose: 3000,
      });
      setShowNotification(true);
    }
  }, [token, showNotification]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
