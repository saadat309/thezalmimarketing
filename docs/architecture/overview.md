# System Architecture Overview

The web application is structured as a decoupled Single Page Application (SPA) frontend built with modern React tooling, paired with a robust, modular PHP/MySQL REST API backend hosted on Apache/cPanel infrastructure, complemented by a Cloudflare Worker for AI-powered chat and knowledge retrieval.

---

## High-Level Topology

```
┌────────────────────────────────────────────────────────┐
│                      Client Browser                    │
│   React 19 SPA (Vite + TanStack Router + React Query)  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / JSON / FormData
                           ├─────────────────────────────┐
                           ▼                             ▼
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│         PHP REST API Backend         │     │         Cloudflare AI Worker         │
│   Front Controller & Route Handlers  │     │     (WASM / Workers AI / LLM)        │
└──────────────────┬───────────────────┘     └──────────────────────────────────────┘
                   │ PDO Driver
                   ▼
┌────────────────────────────────────────────────────────┐
│                   MySQL Database                       │
│           UTF-8mb4 Character Set & Relational Tables   │
└────────────────────────────────────────────────────────┘
```

---

## Component Layers

### 1. Frontend Layer (`src/`)
- **Framework:** React 19 leveraging functional components, hooks, and Concurrent features.
- **Build System:** Vite with Rolldown/ESM bundling for ultra-fast HMR and optimized production builds.
- **Routing:** File-based routing via TanStack Router (`@tanstack/react-router`), supporting nested layouts, root layout wrappers (`__root.jsx`), auth guards, and dynamic route segments.
- **State Management:** TanStack React Query for server cache synchronization and asynchronous state management, combined with Zustand for lightweight global client state (authentication tokens, table preferences, filters).
- **Styling:** Tailwind CSS v4 configured with custom design tokens, CSS variables in `index.css`, and Radix UI primitives.

### 2. Backend API Layer (`api/`)
- **Entry Point & Front Controller:** `api/index.php` intercepts all requests routed through Apache `.htaccess`, normalizing URIs, enforcing CORS headers, handling custom HTTP method overrides (`_method` parameter for `PUT`/`PATCH`/`DELETE` via multipart uploads), and dispatching requests to resource-specific router scripts.
- **Database Connection:** PDO (PHP Data Objects) abstraction layer in `api/config.php` ensuring secure parameterization, prepared statements, utf8mb4 encoding, and dynamic error reporting.
- **Modular Routing:** Dedicated sub-modules in `api/routes/` covering:
  - Core Entities: Properties, categories, cities, societies, phases, maps, files, labels, products, queries, users, roles, and invites.
  - Property Transfer Calculator Suite: Transfer fees, tax rates, rates, property types, phases, fees, fee rules, configuration, and blocks (`calculator-*`).
  - Content & AI Management: Landing sections, available items, and AI tools (`landing-sections`, `landing-available-items`, `ai-tools`).

### 3. AI Worker Layer (`workers/ai-worker/`)
- **Cloudflare Worker:** Standalone TypeScript worker deployed to Cloudflare (`workers/ai-worker`) handling intelligent visitor chat, context retrieval, and structured AI responses.
- **Integration:** Connected via `src/services/ai.js` and configured via environment variables for local (`.dev.vars`) and production environments.

### 4. Data Flow & Integration Layer (`src/lib/`)
- **API Client:** `apiClient.js` provides a centralized `apiFetch` wrapper that automatically attaches dual authentication headers (`Authorization: Bearer <token>` and `X-Auth-Token`), manages JSON and `FormData` content-type headers, and intercepts 401 Unauthorized responses to clear local tokens and redirect to login.
- **Data Adapters:** `src/lib/api.js` includes robust transformation functions (e.g., `transformProperty`) to map database schema snake_case fields into clean frontend camelCase and nested object structures.
