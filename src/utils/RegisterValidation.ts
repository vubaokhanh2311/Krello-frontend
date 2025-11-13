import type { RegistrerRequest } from "../pages/Auth/Register/RegisterType";

export default function validateRegister(form: RegistrerRequest) {
  const errors: Partial<Record<keyof RegistrerRequest, string>> = {};

  if (!form.name) errors.name = "Họ và tên không được để trống";

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
