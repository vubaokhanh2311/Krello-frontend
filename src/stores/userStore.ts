import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UserState } from "../types/UserProfileType";

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      clearUser: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "user-storage" }
  )
);
