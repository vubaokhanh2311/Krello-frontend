export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  jti: string;
  role: string;
  permissions: string[];
}
