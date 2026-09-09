import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import restClient from "../../../api/RestClient";
import { redirectAfterLogin } from "../../../utils/redirectHelper";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "../../../hooks/useGoogleLogin";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserStore.getState();

  const handleGoogleLogin = useCallback(
    async (credential: string) => {
      try {
        setLoading(true);

        const res = await loginWithGoogle(credential);

        if (!res || !res.accessToken || !res.refreshToken) {
          throw new Error("Không nhận được token từ server");
        }

        restClient.setRememberMe(true);
        restClient.setTokens(res.accessToken, res.refreshToken);

        const userProfile = await getUserProfile();
        setUser(userProfile, res.accessToken, res.refreshToken);

        notifications.show({
          title: "Thành công",
          message: "Đăng nhập Google thành công!",
          color: "green",
          autoClose: 1500,
        });

        setTimeout(() => {
          redirectAfterLogin(navigate);
        }, 1000);
      } catch (err) {
        console.error("Google login error:", err);
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };

        notifications.show({
          title: "Đăng nhập thất bại",
          message:
            errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Đăng nhập Google thất bại",
          color: "red",
        });

        setLoading(false);
      }
    },
    [navigate, setUser],
  );

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

      if (!res || !res.accessToken || !res.refreshToken) {
        throw new Error("Không nhận được token từ server");
      }

      restClient.setRememberMe(values.remember);

      restClient.setTokens(res.accessToken, res.refreshToken);

      const userProfile = await getUserProfile();
      setUser(userProfile, res.accessToken, res.refreshToken);

      notifications.show({
        title: "Thành công",
        message: "Đăng nhập thành công!",
        color: "green",
        autoClose: 1500,
      });

      setTimeout(() => {
        redirectAfterLogin(navigate);
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };

      notifications.show({
        title: "Đăng nhập thất bại",
        message:
          errorObj?.response?.data?.message || errorObj?.message || "Đăng nhập thất bại",
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
          placeholder="Nhập email của bạn"
          withAsterisk
          disabled={loading}
          {...form.getInputProps("email")}
        />

        <PasswordInput
          label="Mật khẩu"
          placeholder="Nhập mật khẩu của bạn"
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

        <Link
          to="/forgot-password"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Quên mật khẩu?
        </Link>
      </Group>

      <Button fullWidth type="submit" loading={loading} size="md">
        Đăng nhập
      </Button>

      <p className="text-sm text-slate-600 text-center">
        Bạn chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Đăng ký ngay
        </Link>
      </p>

      <Divider label="Hoặc tiếp tục với" labelPosition="center" />

      <div
        ref={googleButtonRef}
        className="w-full flex justify-center"
        style={{
          minHeight: 44,
          minWidth: 300,
        }}
      />
    </form>
  );
}
