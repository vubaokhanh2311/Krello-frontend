import { useState, FormEvent } from "react";
import { toast } from "react-toastify";

import RestClient from "../../../api/RestClient";
import type { LoginRequest, LoginResponse } from "./LoginType";
import validateLogin from "../../../utils/LoginValidation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});

    const formData: LoginRequest = {
      email: email.trim(),
      password,
    };

    const validationErrors = validateLogin(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }
    setLoading(true);
    try {
      const res = await RestClient.post<LoginResponse>("/auth/login", formData);

      RestClient.setToken(res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);

      toast.success("Đăng nhập thành công!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
        toast.error("Vui lòng kiểm tra lại thông tin!");
      } else {
        toast.error(err.message || "Đăng nhập thất bại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            className={`block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:outline-none sm:text-sm ${
              errors.email
                ? "border-red-500 focus:border-red-600 focus:ring-red-600"
                : "border-gray-300 focus:border-indigo-600 focus:ring-indigo-600"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Mật khẩu
        </label>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            className={`block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:outline-none sm:text-sm ${
              errors.password
                ? "border-red-500 focus:border-red-600 focus:ring-red-600"
                : "border-gray-300 focus:border-indigo-600 focus:ring-indigo-600"
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="ml-2">Ghi nhớ</span>
        </label>

        <a
          href="#"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Quên mật khẩu?
        </a>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        <div className="mt-6 gap-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Google
          </button>
        </div>
      </div>
    </form>
  );
}
