import LoginForm from "./LoginForm";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { notifications } from "@mantine/notifications";
import logo from "../../../assets/images/logo.png";

export default function LoginPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.from) {
      notifications.show({
        title: "Cần đăng nhập",
        message: "Vui lòng đăng nhập để tiếp tục",
        color: "yellow",
        autoClose: 3000,
      });
    }
  }, [location.state]);

  return (
    <div className="flex h-screen flex-col justify-center items-center bg-gray-50 px-4 sm:px-6">
      <div className="w-full sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 sm:px-6 lg:px-10 py-6 shadow sm:rounded-lg">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Logo"
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 object-contain"
            />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-6">
            Đăng nhập
          </h2>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
