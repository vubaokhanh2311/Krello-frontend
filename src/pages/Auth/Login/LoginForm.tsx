import { useState } from "react";
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
import RestClient from "../../../api/RestClient";
import type { LoginRequest, LoginResponse } from "./LoginType";
import validateLogin from "../../../utils/LoginValidation";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginRequest>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: validateLogin,
  });

  const handleSubmit = async (values: LoginRequest) => {
    try {
      setLoading(true);

      const res = await RestClient.post<LoginResponse>("/auth/login", values);
      if (!res || !res.accessToken || !res.refreshToken) {
        throw new Error("Đăng nhập thất bại");
      }
      RestClient.setToken(res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);

      notifications.show({
        title: "Thành công",
        message: "Đăng nhập thành công",
        color: "green",
        autoClose: 1000,
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      notifications.show({
        title: "Thất bại",
        message: error?.message || "Đăng nhập thất bại",
        color: "red",
        autoClose: 3000,
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
          size="md"
          radius="md"
          {...form.getInputProps("email")}
        />

        <PasswordInput
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          withAsterisk
          size="md"
          radius="md"
          {...form.getInputProps("password")}
        />
      </Stack>

      <Group justify="space-between" mt="xs">
        <Checkbox label="Ghi nhớ đăng nhập" />
        <a
          href="#!"
          onClick={(e) => e.preventDefault()}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Quên mật khẩu?
        </a>
      </Group>

      <Button
        type="submit"
        fullWidth
        color="blue"
        size="md"
        radius="md"
        loading={loading}
        mt="sm"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <Divider
        label="Hoặc tiếp tục với"
        labelPosition="center"
        my="md"
        color="gray.3"
      />

      <Button
        variant="default"
        fullWidth
        radius="md"
        leftSection={
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="h-5 w-5"
          />
        }
      >
        Google
      </Button>
    </form>
  );
}
