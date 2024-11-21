import { create } from "zustand";
import { Token } from "@/types";
import { persist, createJSONStorage } from "zustand/middleware";
import { SESSION_NAME } from "@/lib/constants";
import { AuthUser } from "@/auth/factories/authInterface";

interface AuthState {
  user: AuthUser | null
  token: Token;
}

interface AuthActions {
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: Token) => void;
}

export const useAuthStore = create(
  persist<AuthState & AuthActions>(
    (set) => ({
      token: null,
      user: null,

      setToken: (token: Token) => set({ token }),
      setUser: (user: AuthUser | null) => set({ user }),
      logout: () => sessionStorage.removeItem(SESSION_NAME),
    }),
    {
      name: SESSION_NAME,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
