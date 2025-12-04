import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useMapsStore = create((set, get) => ({
  maps: [
    {
      id: uuidv4(),
      title: 'DHA Phase 8 Map',
      type: 'PDF',
      location: 'DHA Phase 8, Lahore',
      size: '15 MB',
      changed_at: '2025-11-20 11:00',
    },
    {
      id: uuidv4(),
      title: 'Bahria Town Karachi Layout',
      type: 'Image',
      location: 'Bahria Town, Karachi',
      size: '5 MB',
      changed_at: '2025-11-25 14:30',
    },
  ],

  // Actions
  addMap: (newMap) => set((state) => ({
    maps: [...state.maps, { ...newMap, id: uuidv4(), changed_at: new Date().toLocaleString() }]
  })),

  editMap: (editedMap) => set((state) => ({
    maps: state.maps.map((map) =>
      map.id === editedMap.id ? { ...editedMap, changed_at: new Date().toLocaleString() } : map
    )
  })),

  deleteMap: (id) => set((state) => ({
    maps: state.maps.filter((map) => map.id !== id)
  })),

  deleteSelectedMaps: (selectedIds) => set((state) => ({
    maps: state.maps.filter((map) => !selectedIds.has(map.id))
  })),

  // Selectors
  getMapsCount: () => {
    return get().maps.length;
  },
}));