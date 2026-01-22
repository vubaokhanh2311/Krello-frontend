import { Navigate, useLocation } from "react-router-dom";
import { type ReactNode, useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import RestClient from "../api/RestClient";

interface Props {
  children: ReactNode;
}

const RequireAuth = ({ children }: Props) => {
  const token = RestClient.getToken();
  const location = useLocation();
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (!token && !notified) {
      notifications.show({
        title: "Cần đăng nhập",
        message: "Vui lòng đăng nhập để truy cập trang này!",
        color: "yellow",
        autoClose: 3000,
      });
      setNotified(true);
    }
  }, [token, notified]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
