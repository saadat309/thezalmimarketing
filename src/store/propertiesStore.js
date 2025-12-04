import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const usePropertiesStore = create((set, get) => ({
  properties: [
    {
      id: uuidv4(),
      title: 'Luxury Villa',
      type: 'Residential',
      price: '500,000',
      status: 'Available',
      changed_at: '2024-12-01 10:00',
      media: [
        { id: uuidv4(), url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Villa1', isPrimary: true, type: 'image' },
        { id: uuidv4(), url: 'https://www.w3schools.com/html/mov_bbb.mp4', isPrimary: false, type: 'video' },
        { id: uuidv4(), url: 'https://www.africau.edu/images/default/sample.pdf', isPrimary: false, type: 'pdf' },
      ],
    },
    {
      id: uuidv4(),
      title: 'Downtown Office Space',
      type: 'Commercial',
      price: '1,200,000',
      status: 'Rented',
      changed_at: '2024-12-01 11:30',
      media: [{ id: uuidv4(), url: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Office1', isPrimary: true, type: 'image' }],
    },
  ],

  // Actions
  addProperty: (newProperty) => set((state) => ({
    properties: [...state.properties, { ...newProperty, id: uuidv4(), changed_at: new Date().toLocaleString() }]
  })),

  editProperty: (editedProperty) => set((state) => ({
    properties: state.properties.map((property) =>
      property.id === editedProperty.id ? { ...editedProperty, changed_at: new Date().toLocaleString() } : property
    )
  })),

  deleteProperty: (id) => set((state) => ({
    properties: state.properties.filter((property) => property.id !== id)
  })),

  deleteSelectedProperties: (selectedIds) => set((state) => ({
    properties: state.properties.filter((property) => !selectedIds.has(property.id))
  })),

  // Selectors
  getPropertiesCount: () => {
    return get().properties.length;
  },
}));
