import { IconMail, IconArrowLeft } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../../api/authService";
import { useState } from "react";
import { Button } from "@mantine/core";
export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
    },

    validate: {
      email: (value) =>
        !value
          ? "Vui lòng nhập email"
          : /^\S+@\S+$/.test(value)
          ? null
          : "Email không hợp lệ",
    },
  });

  const handleSubmit = async (values: { email: string }) => {
    setIsLoading(true);

    try {
      const res = await forgotPassword({ email: values.email });

      notifications.show({
        title: "Đã gửi email",
        message: res.message || "Vui lòng kiểm tra hộp thư đến (và mục spam).",
        color: "teal",
        autoClose: 5000,
      });

      form.reset();
    } catch (error: any) {
      notifications.show({
        title: "Lỗi",
        message:
          error?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100 blur-3xl opacity-50" />
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-blue-100 blur-3xl opacity-50" />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Quên mật khẩu?</h2>
            <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">
              Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục.
            </p>
          </div>

          <form className="space-y-6" onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Email "
              placeholder="nguoidung@example.com"
              leftSection={<IconMail size={16} />}
              size="md"
              radius="md"
              {...form.getInputProps("email")}
            />

            <Button type="submit" loading={isLoading} fullWidth size="md">
              Gửi liên kết
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
    </div>
  );
}
