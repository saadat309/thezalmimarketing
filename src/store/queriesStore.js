import { create } from 'zustand';
import { apiFetch } from '@/lib/apiClient';

export const useQueriesStore = create((set, get) => ({
  unreadCount: 0,

  // Actions
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  fetchUnreadCount: async () => {
    try {
      const response = await apiFetch('/queries/unread-count');
      if (response.ok) {
        const data = await response.json();
        set({ unreadCount: data.count });
      }
    } catch (error) {
      console.error("Failed to fetch unread queries count:", error);
    }
  },

  // Selector
  getUnreadQueriesCount: () => get().unreadCount,
}));
