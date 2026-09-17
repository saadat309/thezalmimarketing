# Backend Architecture

The backend is structured as a modular PHP REST API leveraging the Front Controller pattern and PDO MySQL database access.

---

## Directory Structure (`api/`)

```
api/
├── index.php            # Central front controller & router entry point
├── config.php           # Database PDO connection & global configuration
├── routes/              # Resource route handlers
│   ├── auth.php         # Authentication endpoints (login, register, token verify)
│   ├── properties.php   # Property management CRUD
│   ├── categories.php   # Property categories
│   ├── cities.php       # City locations
│   ├── societies.php    # Housing societies
│   ├── phases.php       # Society phases & sectors
│   ├── maps.php         # Map attachments & site plans
│   ├── files.php        # File & image upload management
│   ├── images.php       # Image handling utilities
│   ├── products.php     # Product catalog management
│   ├── labels.php       # Property badges & labels
│   ├── landing-sections.php # Homepage section content
│   ├── landing-available-items.php # Landing available items
│   ├── queries.php      # Customer contact & inquiry leads
│   ├── users.php        # User administration
│   ├── roles.php        # Role-based access control (RBAC)
│   ├── invites.php      # Team invitations
│   ├── ai-tools.php     # AI integration bridge endpoints
│   └── calculator-*     # Calculator modules (transfer fees, tax rates, rates, property types, phases, fees, fee rules, config, blocks)
└── utils/               # Helper utilities & middleware
    ├── jwt_util.php     # JWT generation and validation
    ├── auth_middleware.php # Request authorization guards
    ├── password_util.php # Secure hashing & verification
    ├── mail_util.php    # PHPMailer integration
    ├── ImageUpload.php  # Image processing & upload handler
    ├── slug_util.php    # Slug generation helper
    └── token_util.php   # Token management utilities
```

---

## Front Controller Pattern (`api/index.php`)

All HTTP requests are rewritten via Apache `.htaccess` to `api/index.php`. The front controller performs:
1. **CORS Headers & Preflight Handling:** Sets appropriate `Access-Control-Allow-Origin`, methods, and headers.
2. **Path Normalization:** Extracts resource segments and identifiers from the request URI.
3. **Method Overriding:** Supports `_method` POST parameter overrides (`PUT`, `PATCH`, `DELETE`) to handle multipart form uploads seamlessly in PHP.
4. **Dispatcher:** Routes requests to the appropriate handler script within `api/routes/`.

---

## Database Layer (`api/config.php`)

- **PDO Connection:** Establishes a secure MySQL connection using PDO with `utf8mb4` character encoding.
- **Error Handling:** Configures PDO exception mode (`PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION`) and environment-aware error reporting.
- **Prepared Statements:** All database queries utilize parameterized prepared statements to prevent SQL injection vulnerabilities.
