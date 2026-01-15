
import { api } from "@/utils/api";
import type { User } from "@/utils/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";


interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (token: string, user: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      fetchUser: async () => {
        const { token } = get();

        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const user = await api.user.me();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching user:", error);
          get().logout();
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });

        // Check for token in URL (from OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");

        if (tokenFromUrl) {
          // Remove token from URL
          window.history.replaceState({}, document.title, window.location.pathname);

          // Store token and fetch user
          set({ token: tokenFromUrl });
          await get().fetchUser();
        } else {
          // Try to fetch user with existing token
          await get().fetchUser();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
      }),
    }
  )
);
