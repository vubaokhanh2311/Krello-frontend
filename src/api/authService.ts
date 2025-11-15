import RestClient from "./RestClient";
import type { LoginRequest, LoginResponse } from "../types/LoginType";
import type { RegistrerRequest, RegisterResponse } from "../types/RegisterType";
import type { UserProfile } from "../types/UserProfileType";
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

export async function getUserProfile(): Promise<UserProfile> {
  const res = await RestClient.get<UserProfile>("/users/profile");
  return res;
}
