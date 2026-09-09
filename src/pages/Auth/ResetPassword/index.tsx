import { IconLock, IconCheck, IconArrowLeft } from "@tabler/icons-react";
import { PasswordInput, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../../../api/authService";
import { useState } from "react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },

    validate: {
      newPassword: (value) =>
        !value
          ? "Vui lòng nhập mật khẩu mới"
          : value.length < 6
          ? "Mật khẩu phải có ít nhất 8 ký tự"
          : null,

      confirmPassword: (value, values) =>
        value !== values.newPassword ? "Mật khẩu xác nhận không khớp" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!email || !token) {
      notifications.show({
        title: "Lỗi xác thực",
        message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
        color: "red",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPassword({
        email,
        token,
        newPassword: values.newPassword,
      });

      notifications.show({
        title: "Thành công!",
        message: res.message || "Mật khẩu đã được cập nhật.",
        color: "teal",
        icon: <IconCheck size={18} />,
        autoClose: 3000,
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      notifications.show({
        title: "Đã xảy ra lỗi",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl ">
        <h2 className="text-3xl font-bold text-center mb-2">
          Đặt lại mật khẩu
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Tạo mật khẩu mới mạnh mẽ và an toàn cho tài khoản của bạn.
        </p>

        <form className="space-y-6" onSubmit={form.onSubmit(handleSubmit)}>
          <PasswordInput
            label="Mật khẩu mới"
            placeholder="••••••••"
            leftSection={<IconLock size={16} />}
            size="md"
            radius="md"
            {...form.getInputProps("newPassword")}
          />

          <PasswordInput
            label="Xác nhận mật khẩu"
            placeholder="••••••••"
            leftSection={<IconLock size={16} />}
            size="md"
            radius="md"
            {...form.getInputProps("confirmPassword")}
          />

          <Button type="submit" loading={isLoading} fullWidth size="md">
            Đặt lại mật khẩu
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <IconArrowLeft size={16} className="mr-1" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
