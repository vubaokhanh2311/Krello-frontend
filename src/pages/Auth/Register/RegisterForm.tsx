import { useState } from "react";
import {
  Button,
  TextInput,
  PasswordInput,
  Stack,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { RegistrerRequest } from "../../../types/RegisterType";
import validateRegister from "../../../utils/RegisterValidation";
import { register } from "../../../api/authService";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "../../../hooks/useGoogleLogin";
import { loginWithGoogle, getUserProfile } from "../../../api/authService";
import RestClient from "../../../api/RestClient";
import { useUserStore } from "../../../stores/userStore";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useUserStore.getState();
  const form = useForm<RegistrerRequest>({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validate: validateRegister,
  });

  const handleGoogleRegister = async (credential: string) => {
    try {
      setLoading(true);

      const res = await loginWithGoogle(credential);
      if (!res) throw new Error("Đăng nhập Google thất bại");

      RestClient.setToken(res.accessToken);
      const userProfile = await getUserProfile();
      setUser(userProfile, res.accessToken, res.refreshToken);
      notifications.show({
        title: "Thành công",
        message: "Đăng nhập Google thành công",
        color: "green",
        autoClose: 1000,
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      const errorObj = err as { message?: string };
      notifications.show({
        title: "Thất bại",
        message: errorObj?.message || "Đăng nhập Google thất bại",
        color: "red",
      });
      setLoading(false);
    }
  };

  const googleButtonRef = useGoogleLogin({
    onSuccess: handleGoogleRegister,
  });

  const handleSubmit = async (values: RegistrerRequest) => {
    try {
      setLoading(true);

      const res = await register(values);
      if (!res) throw new Error("Đăng ký thất bại");

      notifications.show({
        title: "Thành công",
        message: "Đăng ký thành công",
        color: "green",
        autoClose: 1000,
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      const errorObj = error as { message?: string };
      notifications.show({
        title: "Thất bại",
        message: errorObj?.message || "Đăng ký thất bại",
        color: "red",
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
      <Stack>
        <TextInput
          label="Họ và Tên"
          placeholder="Nhập họ và tên"
          withAsterisk
          disabled={loading}
          {...form.getInputProps("name")}
        />

        <TextInput
          label="Email"
          placeholder="Nhập email"
          withAsterisk
          disabled={loading}
          {...form.getInputProps("email")}
        />

        <PasswordInput
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          withAsterisk
          disabled={loading}
          {...form.getInputProps("password")}
        />
      </Stack>

      <Button fullWidth type="submit" loading={loading}>
        Đăng ký
      </Button>

      <p className="text-sm text-slate-600 text-center">
        Bạn đã có tài khoản?{" "}
        <Link to="/login" className="font-semibold text-indigo-600">
          Đăng nhập
        </Link>
      </p>

      <Divider label="Hoặc tiếp tục với" labelPosition="center" />

      <div
        ref={googleButtonRef}
        className="w-full flex justify-center"
        style={{ minHeight: 44 }}
      />
    </form>
  );
}
