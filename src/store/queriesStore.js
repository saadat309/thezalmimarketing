import { create } from 'zustand';

export const useQueriesStore = create((set, get) => ({
  unreadCount: 0,

  // Actions
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  fetchUnreadCount: async (token) => {
    if (!token) return;
    try {
      const response = await fetch('/api/queries/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
