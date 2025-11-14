import RestClient from "./RestClient";
import type {
  LoginRequest,
  LoginResponse,
} from "../pages/Auth/Login/LoginType";
import type {
  RegistrerRequest,
  RegisterResponse,
} from "../pages/Auth/Register/RegisterType";

export async function login(values: LoginRequest): Promise<LoginResponse> {
  const res = await RestClient.post<LoginResponse>("/auth/login", values);

  return res;
}

export async function register(
  values: RegistrerRequest
): Promise<RegisterResponse> {
  const res = await RestClient.post<RegisterResponse>("/auth/register", values);

  return res;
}
