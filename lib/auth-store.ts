import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export type Role = "CANDIDATE" | "EMPLOYER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  candidateProfile?: {
    id: string;
    fullName: string | null;
    photoUrl: string | null;
  };
  employerProfile?: {
    id: string;
    companyName: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        Cookies.set("token", token, { expires: 7 });
        Cookies.set("user", JSON.stringify(user), { expires: 7 });
      },
      clearAuth: () => {
        set({ user: null, token: null });
        Cookies.remove("token");
        Cookies.remove("user");
      },
      isAuthenticated: () => {
        const state = get();
        return !!(state.user && state.token);
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
