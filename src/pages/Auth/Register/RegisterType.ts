export interface RegistrerRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
  roleId: string | null;
}
