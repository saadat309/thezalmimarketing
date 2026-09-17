# Documentation Index

Welcome to the official technical documentation suite for the web application and administrative management system.

---

## Documentation Sections

### 1. Architecture (`docs/architecture/`)
- [Overview](architecture/overview.md) - High-level system topology, frontend/backend separation, and data flow.
- [Frontend Architecture](architecture/frontend.md) - React 19, Vite, TanStack Router, TanStack Query, and Zustand stores.
- [Backend Architecture](architecture/backend.md) - PHP Front Controller, PDO MySQL configuration, modular route handlers, and calculator/AI modules.
- [API Integration](architecture/api-integration.md) - `apiClient.js` fetch wrapper, dual auth headers, error interception, and data adapters.

### 2. Design System (`docs/design-system/`)
- [Design System Overview](design-system/overview.md) - Visual philosophy, brand direction, and accessibility (a11y).
- [Tailwind & Tokens](design-system/tailwind-and-tokens.md) - Tailwind CSS v4 setup and CSS theme variables.
- [Components](design-system/components.md) - UI primitives, Radix components, data tables, calculator widgets, and administrative dashboard views.

### 3. API Reference (`docs/api/`)
- [Authentication](api/authentication.md) - JWT token lifecycle, headers, and RBAC middleware.
- [Endpoints](api/endpoints.md) - Comprehensive catalog of REST endpoints (`/api/properties`, `/api/calculator-*`, `/api/landing-sections`, `/api/ai-tools`, etc.).

### 4. Property Transfer Calculator & Schema
- [Property Transfer Calculator Schema](property_transfer_calculator_schema.sql) - Database schema for transfer fees, tax rates, rates, property types, phases, fees, fee rules, and blocks.

### 5. AI Assistant & Cloudflare Worker
- [AI Environment Guide](AI_ENVIRONMENT_GUIDE.md) - Local and production configuration guide for the Cloudflare AI Worker (`workers/ai-worker`) and frontend integration.

### 6. Deployment (`docs/deployment/`)
- [cPanel & MySQL](deployment/cpanel-mysql.md) - Production deployment guide on cPanel and Apache.
- [Local Development](deployment/local-development.md) - Setting up local Node.js, PHP, and Cloudflare Worker development environments.
