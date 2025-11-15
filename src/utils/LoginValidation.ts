import type { LoginRequest } from "../types/LoginType";

export default function validateLogin(form: LoginRequest) {
  const errors: Partial<Record<keyof LoginRequest, string>> = {};

  if (!form.email) errors.email = "Email không được để trống";
  else if (!/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Email không hợp lệ";

  if (!form.password) {
    errors.password = "Mật khẩu không được để trống";
  } else if (form.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  return errors;
}
