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
      updateUser: (user) => set((state) => ({ ...state, user })),
      clearUser: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "user-storage" }
  )
);
