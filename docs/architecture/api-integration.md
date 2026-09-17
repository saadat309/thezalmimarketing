# API Integration

Frontend-to-backend communication is centralized through robust utility wrappers located in `src/lib/`.

---

## The API Client (`src/lib/apiClient.js`)

`apiFetch` provides a standardized wrapper around the native `fetch` API with key production features:
- **Base URL Resolution:** Automatically targets the appropriate API endpoint (`/api/...`).
- **Dual Authentication Headers:** Injects both `Authorization: Bearer <token>` and `X-Auth-Token: <token>` to guarantee compatibility with strict cPanel / Apache configurations.
- **Content-Type Management:** Automatically sets `Content-Type: application/json` for JSON payloads while omitting it for `FormData` objects to let the browser compute multipart boundary headers.
- **Authentication Interceptor:** Detects `401 Unauthorized` responses, clears invalid auth session tokens, and redirects users to the login route.

---

## Data Transformation Adapters (`src/lib/api.js`)

Database schemas often use snake_case naming conventions (e.g., `property_title`, `society_id`, `created_at`), while the frontend React components expect camelCase models. `src/lib/api.js` includes transformation adapters:
- **`transformProperty(raw)`:** Maps raw database snake_case fields into structured nested objects for the frontend UI.
- **Fallback Mocks:** Includes robust fallback mock collections ensuring seamless UI rendering and resilience during offline development or database maintenance.
