import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useQueriesStore = create((set, get) => ({
  queries: [
    {
      id: uuidv4(),
      propertyTitle: "Luxury Villa",
      name: "Alice Smith",
      email: "alice.smith@example.com",
      phone: "123-456-7890",
      message:
        "I am very interested in this property. Can I schedule a viewing next week?",
      changed_at: "2025-09-01 09:00", // Existing older data point
      isRead: false,
    },
    {
      id: uuidv4(),
      propertyTitle: "Commercial Plot DHA Phase 6",
      name: "David Lee",
      email: "david.lee@example.com",
      phone: "111-222-3333",
      message: "Looking for investment opportunities. Is this plot still open?",
      changed_at: "2025-09-15 10:00", // Existing older data point
      isRead: true,
    },
    {
      id: uuidv4(),
      propertyTitle: "Apartment in Gulberg",
      name: "Eve Davis",
      email: "eve.davis@example.com",
      phone: "444-555-6666",
      message: "Interested in a 2-bedroom apartment. What are the options?",
      changed_at: "2025-09-20 11:00", // Existing older data point
      isRead: false,
    },
    {
      id: uuidv4(),
      propertyTitle: "Farm House on Bedian Road",
      name: "Frank White",
      email: "frank.white@example.com",
      phone: "777-888-9999",
      message: "Seeking a large farm house with some land. Details?",
      changed_at: "2025-10-05 14:00", // Existing older data point
      isRead: true,
    },
    {
      id: uuidv4(),
      propertyTitle: "Office Space Model Town",
      name: "Grace Black",
      email: "grace.black@example.com",
      phone: "333-444-5555",
      message: "Need small office space for startup. Available options?",
      changed_at: "2025-10-20 09:30", // Existing older data point
      isRead: false,
    },
    {
      id: uuidv4(),
      propertyTitle: "Residential Plot F-8 Islamabad",
      name: "Henry Green",
      email: "henry.green@example.com",
      phone: "666-777-8888",
      message: "Looking for a plot in F-8. Any leads?",
      changed_at: "2025-11-01 10:30", // Existing older data point
      isRead: true,
    },
    // --- New queries for last 30 days ---
    {
      id: uuidv4(),
      propertyTitle: "New Project Launch Inquiry",
      name: "Isabelle Taylor",
      email: "isabelle.t@example.com",
      phone: "123-123-1234",
      message: "Details about the new residential project?",
      changed_at: "2025-11-10 08:30",
      isRead: false,
    },
    {
      id: uuidv4(),
      propertyTitle: "Investment Opportunity DHA Phase 7",
      name: "Jack Wilson",
      email: "jack.w@example.com",
      phone: "456-456-4567",
      message: "Seeking commercial plot investment.",
      changed_at: "2025-11-15 11:00",
      isRead: true,
    },
    {
      id: uuidv4(),
      propertyTitle: "Rental Inquiry Bahria Town",
      name: "Karen Miller",
      email: "karen.m@example.com",
      phone: "789-789-7890",
      message: "Looking for a house for rent.",
      changed_at: "2025-11-20 14:00",
      isRead: false,
    },
    {
      id: uuidv4(),
      propertyTitle: "Property Valuation Request",
      name: "Liam Davis",
      email: "liam.d@example.com",
      phone: "111-111-1111",
      message: "Need valuation for my property.",
      changed_at: "2025-11-25 09:45",
      isRead: true,
    },
    // --- Existing recent queries ---
    {
      id: uuidv4(),
      propertyTitle: "Luxury Villa",
      name: "Alice Smith",
      email: "alice.smith@example.com",
      phone: "123-456-7890",
      message:
        "I am very interested in this property. Can I schedule a viewing next week?",
      changed_at: "2025-11-28 10:00",
      isRead: true,
    },
    {
      id: uuidv4(),
      propertyTitle: "Downtown Office Space",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      phone: "098-765-4321",
      message: "What are the payment terms for this office space?",
      changed_at: "2025-11-29 11:00",
      isRead: false,
    },
    {
      id: uuidv4(),
      propertyTitle: "DHA Phase 8 - 5 Marla Residential File",
      name: "Charlie Brown",
      email: "charlie.b@example.com",
      phone: "555-123-4567",
      message:
        "Is this file still available? What is the current market value?",
      changed_at: "2025-11-29 15:00",
      isRead: true,
    },
    {
      id: uuidv4(),
      propertyTitle: "Commercial Plot DHA Phase 6",
      name: "David Lee",
      email: "david.lee@example.com",
      phone: "111-222-3333",
      message: "Looking for investment opportunities. Is this plot still open?",
      changed_at: "2025-11-30 09:00",
      isRead: false,
    },
    {
      id: uuidv4(),
      propertyTitle: "Commercial Plot DHA Phase 6",
      name: "David Lee",
      email: "david.lee@example.com",
      phone: "111-222-3333",
      message: "Looking for investment opportunities. Is this plot still open?",
      changed_at: "2025-11-30 09:00",
      isRead: false,
    },
    {
      id: uuidv4(),
      propertyTitle: "Commercial Plot DHA Phase 6",
      name: "David Lee",
      email: "david.lee@example.com",
      phone: "111-222-3333",
      message: "Looking for investment opportunities. Is this plot still open?",
      changed_at: "2025-11-30 09:00",
      isRead: false,
    },
    {
      id: uuidv4(),
      propertyTitle: "Commercial Plot DHA Phase 6",
      name: "David Lee",
      email: "david.lee@example.com",
      phone: "111-222-3333",
      message: "Looking for investment opportunities. Is this plot still open?",
      changed_at: "2025-11-30 09:00",
      isRead: false,
    },
    {
      id: uuidv4(),
      propertyTitle: "Apartment in Gulberg",
      name: "Eve Davis",
      email: "eve.davis@example.com",
      phone: "444-555-6666",
      message: "Interested in a 2-bedroom apartment. What are the options?",
      changed_at: "2025-12-01 12:00",
      isRead: true,
    },
    {
      id: uuidv4(),
      propertyTitle: "Farm House on Bedian Road",
      name: "Frank White",
      email: "frank.white@example.com",
      phone: "777-888-9999",
      message: "Seeking a large farm house with some land. Details?",
      changed_at: "2025-12-03 16:00",
      isRead: false,
    },
  ],

  // Actions
  addQuery: (newQuery) =>
    set((state) => ({
      queries: [
        ...state.queries,
        {
          ...newQuery,
          id: uuidv4(),
          changed_at: new Date().toLocaleString(),
          isRead: false,
        },
      ],
    })),

  editQuery: (editedQuery) =>
    set((state) => ({
      queries: state.queries.map((query) =>
        query.id === editedQuery.id
          ? { ...editedQuery, changed_at: new Date().toLocaleString() }
          : query
      ),
    })),

  deleteQuery: (id) =>
    set((state) => ({
      queries: state.queries.filter((query) => query.id !== id),
    })),

  deleteSelectedQueries: (selectedIds) =>
    set((state) => ({
      queries: state.queries.filter((query) => !selectedIds.has(query.id)),
    })),

  markAsRead: (queryId) =>
    set((state) => ({
      queries: state.queries.map((query) =>
        query.id === queryId ? { ...query, isRead: true } : query
      ),
    })),

  // Selectors
  getUnreadQueriesCount: () => {
    return get().queries.filter((query) => query.isRead === false).length;
  },
}));
