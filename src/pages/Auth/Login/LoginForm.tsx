import { useState } from "react";
import { useUserStore } from "../../../stores/userStore";
import {
  Button,
  Checkbox,
  Group,
  TextInput,
  PasswordInput,
  Stack,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { LoginRequest } from "../../../types/LoginType";
import validateLogin from "../../../utils/LoginValidation";
import {
  login,
  getUserProfile,
  loginWithGoogle,
} from "../../../api/authService";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "../../../hooks/useGoogleLogin";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useUserStore.getState();

  const redirectAfterLogin = () => {
    const redirectPath = localStorage.getItem("redirectAfterLogin");
    const inviteToken = localStorage.getItem("inviteToken");

    if (redirectPath) {
      localStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectPath;
    } else if (inviteToken) {
      localStorage.removeItem("inviteToken");
      window.location.href = `/invite?token=${inviteToken}`;
    } else {
      window.location.href = "/";
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    try {
      setLoading(true);

      const res = await loginWithGoogle(credential);
      if (!res) throw new Error("Không nhận được phản hồi từ server");

      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("accessToken", res.accessToken);

      const userProfile = await getUserProfile();
      setUser(userProfile, res.accessToken, res.refreshToken);

      notifications.show({
        title: "Thành công",
        message: "Đăng nhập Google thành công",
        color: "green",
        autoClose: 1000,
      });

      setTimeout(redirectAfterLogin, 1000);
    } catch (err: any) {
      notifications.show({
        title: "Thất bại",
        message: err?.message || "Đăng nhập Google thất bại",
        color: "red",
      });
      setLoading(false);
    }
  };

  const googleButtonRef = useGoogleLogin({
    onSuccess: handleGoogleLogin,
  });

  const form = useForm<LoginRequest>({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    validate: validateLogin,
  });

  const handleSubmit = async (values: LoginRequest) => {
    try {
      setLoading(true);

      const res = await login(values);
      if (!res) throw new Error("Đăng nhập thất bại");

      // 🔥 QUYẾT ĐỊNH STORAGE TẠI ĐÂY
      if (values.remember) {
        localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.setItem("accessToken", res.accessToken);
      } else {
        sessionStorage.setItem("refreshToken", res.refreshToken);
        sessionStorage.setItem("accessToken", res.accessToken);
      }

      const userProfile = await getUserProfile();
      setUser(userProfile, res.accessToken, res.refreshToken);

      notifications.show({
        title: "Thành công",
        message: "Đăng nhập thành công",
        color: "green",
        autoClose: 1000,
      });

      setTimeout(redirectAfterLogin, 1000);
    } catch (err: any) {
      notifications.show({
        title: "Thất bại",
        message: err?.message || "Đăng nhập thất bại",
        color: "red",
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
      <Stack>
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

      <Group justify="space-between">
        <Checkbox
          label="Ghi nhớ đăng nhập"
          disabled={loading}
          {...form.getInputProps("remember", { type: "checkbox" })}
        />

        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </Group>

      <Button fullWidth type="submit" loading={loading}>
        Đăng nhập
      </Button>

      <p className="text-sm text-slate-600 text-center">
        Bạn chưa có tài khoản?{" "}
        <Link to="/register" className="font-semibold text-indigo-600">
          Đăng ký
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
