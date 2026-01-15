import RestClient from "./RestClient";
import type { LoginRequest, LoginResponse } from "../types/LoginType";
import type { RegistrerRequest, RegisterResponse } from "../types/RegisterType";
import type { UserProfile } from "../types/UserProfileType";
import { useUserStore } from "../stores/userStore";
import socketService from "../service/socket.service";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../types/PasswordType";
import { removeFcmToken } from "../api/notificationService";

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

export const logout = async () => {
  try {
    const token = localStorage.getItem("fcm_token");
    if (token) {
      await removeFcmToken(token);
      localStorage.removeItem("fcm_token");
    }
  } catch (e) {
    console.warn("remove fcm token failed", e);
  } finally {
    socketService.disconnect();
    useUserStore.getState().clearUser();
    RestClient.clearTokens();
    window.location.href = "/login";
  }
};

export async function forgotPassword(
  values: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const res = await RestClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    values
  );
  return res;
}

export async function resetPassword(
  values: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const res = await RestClient.post<ResetPasswordResponse>(
    "/auth/reset-password",
    values
  );
  return res;
}
