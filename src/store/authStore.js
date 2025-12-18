import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false, // Derived from token presence
      login: (token, user) => set({ token, user, isAuthenticated: !!token }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // name of the item in localStorage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);
