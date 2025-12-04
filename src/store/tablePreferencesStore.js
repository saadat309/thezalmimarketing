// src/store/tablePreferencesStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const initialPreferenceState = {
  columnVisibility: {},
  sorting: [],
  pagination: { pageIndex: 0, pageSize: 10 },
  rowOrder: null, // Add rowOrder here
  // Add other preferences here as needed, e.g., filters
};

export const useTablePreferencesStore = create(
  persist(
    (set, get) => ({
      // State structure
      preferences: {}, // { [preferenceKey]: { columnVisibility, sorting, pagination } }
      _hasHydrated: false, // Add this to the initial state

      // Actions
      setPreference: (key, type, value) => {
        set((state) => {
          const currentPrefsForKey = state.preferences[key] || initialPreferenceState; // Ensure defaults are present
          return {
            preferences: {
              ...state.preferences,
              [key]: {
                ...currentPrefsForKey, // Spread current preferences for this key (including defaults if new)
                [type]: value, // Overlay with the specific updated type
              },
            },
          };
        });
      },

      getPreference: (key, type) => {
        return get().preferences[key]?.[type];
      },

      resetPreferences: (key) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: initialPreferenceState, // Reset to defined initial defaults
          },
        }));
      },

      // Helper to get all preferences for a key
      getAllPreferences: (key) => {
        return get().preferences[key] || initialPreferenceState;
      },

      // Action to hydrate initial state for a new key
      initializePreferences: (key) => {
        if (!get().preferences[key]) {
          set((state) => ({
            preferences: {
              ...state.preferences,
              [key]: initialPreferenceState,
            },
          }));
        }
      },

      setHasHydrated: (state) => { // Action to update _hasHydrated
        set({
          _hasHydrated: state
        });
      },
    }),
    {
      name: 'table-preferences-storage', // name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: () => (state) => { // Use onRehydrateStorage
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
