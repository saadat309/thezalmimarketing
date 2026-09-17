# API Authentication & Security

The backend implements secure token-based authentication and role-based access control (RBAC).

---

## Authentication Flow

1. **Login Request:** Clients submit credentials (`email`, `password`) to `/api/auth/login`.
2. **Token Generation:** Upon successful password verification (`password_util.php`), a JWT or secure authentication token is generated (`jwt_util.php`).
3. **Storage & Transmission:** The frontend stores the token in local storage / Zustand state and attaches it to subsequent requests.

---

## Headers

To ensure robust compatibility across various Apache and cPanel server configurations (which may strip standard Authorization headers), the API client injects dual headers:
- `Authorization: Bearer <token>`
- `X-Auth-Token: <token>`

---

## Authorization Middleware

`api/utils/auth_middleware.php` inspects incoming requests, validates tokens, extracts user roles and permissions, and restricts administrative endpoints to authorized users.
