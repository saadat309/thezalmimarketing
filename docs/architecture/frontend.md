# Frontend Architecture & Technical Specifications

The frontend of the application is an enterprise-grade Single Page Application (SPA) built with React 19, Vite, TanStack Router, TanStack Query, Zustand, and Tailwind CSS v4. It delivers high-performance client-side rendering, robust caching, seamless data mutations, and a comprehensive administrative dashboard.

---

## 1. Technology Stack & Build Pipeline

- **Core Library:** React 19 (`react`, `react-dom`) leveraging concurrent rendering, modern hooks, and functional components.
- **Build Tool & Bundler:** Vite powered by `rolldown-vite` (`vite: "npm:rolldown-vite@7.2.2"`), providing lightning-fast Hot Module Replacement (HMR) and optimized ES module bundling for production.
- **Type Safety & Linting:** ESLint (`@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) enforcing code style consistency.
- **Compiler Optimizations:** Babel Plugin React Compiler (`babel-plugin-react-compiler`) for automatic memoization and performance tuning.

---

## 2. File-Based Routing Architecture

The application utilizes **TanStack Router** (`@tanstack/react-router`) with automatic type-safe route tree generation (`@tanstack/router-plugin` generating `src/routeTree.gen.ts`).

### Directory Layout (`src/routes/`)
- **Root Layout (`src/routes/__root.jsx`):** Serves as the top-level application wrapper. It injects global context providers (TanStack Query client provider, toast notification containers via Sonner), error boundaries, layout headers (`Navbar`, `Footer`), and root outlet rendering.
- **File-Based Segments:** 
  - `src/routes/index.jsx`: Homepage landing view featuring hero sections, category cards, featured property carousels, and review modules.
  - `src/routes/search.jsx`: Advanced property search and filtering view.
  - `src/routes/properties/index.jsx`: Comprehensive property catalog and detail view routing.
- **Route Groups & Protected Views:**
  - `src/routes/(auth)/`: Grouped authentication routes (login, password reset) isolated from dashboard layouts.
  - `src/routes/dashboard/`: Protected administrative layout containing resource management views (properties, categories, cities, societies, phases, maps, files, labels, queries, users, roles, invites).

---

## 3. State Management Architecture

The application adopts a hybrid state management pattern, separating server synchronization from local client state:

### A. Server State & Caching (`TanStack React Query`)
- **Package:** `@tanstack/react-query` v5.
- **Responsibilities:** Managing remote API queries, background refetching, cache invalidation, optimistic updates for CRUD operations, and pagination state.
- **Error Handling:** Centralized query/mutation error interception with automatic retry policies and toast feedback.

### B. Client & Global State (`Zustand`)
- **Package:** `zustand` v5.
- **Store Inventory (`src/store/`):**
  - `authStore.js`: Manages user authentication tokens, current user profile, roles, permissions, and login/logout lifecycle actions.
  - `propertiesStore.js`: Handles local property filtering state, active search queries, pagination parameters, and selection states.
  - `queriesStore.js`: Manages customer inquiry leads and communication state.
  - `mapsStore.js` & `filesStore.js`: Controls media upload queues, map file attachments, and preview states.
  - `tablePreferencesStore.js`: Persists administrative table view preferences (column visibility, sorting, page size).

---

## 4. API Integration & Data Transformation Layer

Communication with the PHP backend is handled through dedicated client libraries in `src/lib/`:
- **`apiClient.js` (`apiFetch`):** Standardized wrapper injecting dual authentication headers (`Authorization: Bearer <token>` and `X-Auth-Token`), managing JSON/FormData serialization, and automatically intercepting `401 Unauthorized` responses to clear invalid sessions and redirect users.
- **`api.js` & Adapters:** Implements endpoint fetchers paired with data transformation adapters (e.g., `transformProperty`). These adapters bridge raw MySQL database snake_case fields (e.g., `society_id`, `category_name`, `created_at`) to clean, nested camelCase object models expected by React components.

---

## 5. Form Handling & Validation

- **Libraries:** `react-hook-form` paired with `@hookform/resolvers` and `zod` for rigorous schema validation.
- **Form Architecture:** Reusable form modules (e.g., `src/components/dashboard/user-form/`, `src/components/dashboard/query-form/`) enforce type safety, real-time client-side validation, and structured submission payloads.
