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
export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<RegistrerRequest>({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validate: validateRegister,
  });

  const handleSubmit = async (values: RegistrerRequest) => {
    try {
      setLoading(true);

      const res = await register(values);
      if (!res) {
        notifications.show({
          title: "Thất bại",
          message: "Đăng ký thất bại",
          color: "red",
          autoClose: 3000,
        });
      }

      notifications.show({
        title: "Thành công",
        message: "Đăng ký thành công",
        color: "green",
        autoClose: 1000,
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error: any) {
      notifications.show({
        title: "Thất bại",
        message: error?.message || "Đăng ký thất bại",
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
          label="Họ và Tên"
          placeholder="Nhập họ và tên"
          withAsterisk
          size="md"
          radius="md"
          {...form.getInputProps("name")}
        />
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

      <Button
        type="submit"
        fullWidth
        color="blue"
        size="md"
        radius="md"
        loading={loading}
        mt="sm"
      >
        {loading ? "Đang đăng ký..." : "Đăng ký"}
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
