# Documentation Index

Welcome to the official technical documentation suite for the web application.

---

## Documentation Sections

### 1. Architecture (`docs/architecture/`)
- [Overview](architecture/overview.md) - High-level system topology, frontend/backend separation, and data flow.
- [Frontend Architecture](architecture/frontend.md) - React 19, Vite, TanStack Router, TanStack Query, and Zustand stores.
- [Backend Architecture](architecture/backend.md) - PHP Front Controller, PDO MySQL configuration, and modular route handlers.
- [API Integration](architecture/api-integration.md) - `apiClient.js` fetch wrapper, dual auth headers, error interception, and data adapters.

### 2. Design System (`docs/design-system/`)
- [Overview](design-system/overview.md) - Visual philosophy and brand direction.
- [Tailwind & Tokens](design-system/tailwind-and-tokens.md) - Tailwind CSS v4 setup and CSS variables.
- [Components](design-system/components.md) - UI primitives, Radix components, modals, and tables.

### 3. API Reference (`docs/api/`)
- [Authentication](api/authentication.md) - JWT token lifecycle, headers, and RBAC middleware.
- [Endpoints](api/endpoints.md) - Comprehensive catalog of REST endpoints (`/api/properties`, `/api/categories`, etc.).

### 4. Deployment (`docs/deployment/`)
- [cPanel & MySQL](deployment/cpanel-mysql.md) - Production deployment guide on cPanel and Apache.
- [Local Development](deployment/local-development.md) - Setting up local Node.js and PHP development environments.
