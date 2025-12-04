import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useFilesStore = create((set, get) => ({
  files: [
    {
      id: uuidv4(),
      title: 'DHA Phase 8 - 5 Marla Residential File',
      type: 'Allocation',
      price: '3,000,000',
      status: 'Available',
      is_file: true,
      changed_at: '2024-12-01 09:00',
    },
    {
      id: uuidv4(),
      title: 'Bahria Town Karachi - 125 Sq. Yd. Commercial File',
      type: 'Affidavit',
      price: '8,500,000',
      status: 'Available',
      is_file: true,
      changed_at: '2024-12-01 12:00',
    },
  ],

  // Actions
  addFile: (newFile) => set((state) => ({
    files: [...state.files, { ...newFile, id: uuidv4(), is_file: true, changed_at: new Date().toLocaleString() }]
  })),

  editFile: (editedFile) => set((state) => ({
    files: state.files.map((file) =>
      file.id === editedFile.id ? { ...editedFile, changed_at: new Date().toLocaleString() } : file
    )
  })),

  deleteFile: (id) => set((state) => ({
    files: state.files.filter((file) => file.id !== id)
  })),

  deleteSelectedFiles: (selectedIds) => set((state) => ({
    files: state.files.filter((file) => !selectedIds.has(file.id))
  })),

  // Selectors
  getFilesCount: () => {
    return get().files.length;
  },
}));