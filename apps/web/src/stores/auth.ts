import { create } from "zustand";
import { User, Token } from "@/types";
import { persist, createJSONStorage } from "zustand/middleware";
import { SESSION_NAME } from "@/lib/constants";

interface AuthState {
  user: User | null;
  token: Token;
}

interface AuthActions {
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: Token) => void;
}

export const useAuthStore = create(
  persist<AuthState & AuthActions>(
    (set) => ({
      token: null,
      user: null,

      setToken: (token: Token) => set({ token }),
      setUser: (user: User | null) => set({ user }),
      logout: () => sessionStorage.removeItem(SESSION_NAME),
    }),
    {
      name: SESSION_NAME,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
