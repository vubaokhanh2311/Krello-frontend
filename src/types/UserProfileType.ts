export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  permissions?: string[];
}

export interface UserState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (
    user: UserProfile,
    accessToken: string,
    refreshToken: string
  ) => void;
  clearUser: () => void;
}
