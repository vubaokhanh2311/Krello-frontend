import RestClient from "./RestClient";
import type { LoginRequest, LoginResponse } from "../types/LoginType";
import type { RegistrerRequest, RegisterResponse } from "../types/RegisterType";
import type { UserProfile } from "../types/UserProfileType";
import { useUserStore } from "../stores/userStore";
import socketService from "../service/socket.service";

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

export async function loginWithGoogle(
  googleToken: string
): Promise<LoginResponse> {
  const res = await RestClient.post<LoginResponse>("/auth/google", {
    googleToken,
  });
  return res;
}

export async function getUserProfile(): Promise<UserProfile> {
  const res = await RestClient.get<UserProfile>("/users/profile");
  return res;
}

export const logout = () => {
  socketService.disconnect();
  useUserStore.getState().clearUser();
  RestClient.clearTokens();
  window.location.href = "/login";
};
