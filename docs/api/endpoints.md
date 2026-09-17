# API Endpoints Reference

The backend provides a comprehensive catalog of RESTful endpoints under `/api/`.

---

## Core Resource Endpoints

- **Properties (`/api/properties`)**
  - `GET /api/properties`: Retrieve list of properties (supports pagination, filtering by category, city, society).
  - `GET /api/properties?id={id}`: Retrieve a single property record.
  - `POST /api/properties`: Create a new property listing.
  - `PUT /api/properties` or `POST` with `_method=PUT`: Update an existing property.
  - `DELETE /api/properties`: Delete a property record.

- **Categories & Products (`/api/categories`, `/api/products`)**
  - `GET /api/categories`: List property categories (Residential, Commercial, Plots, etc.).
  - `POST /api/categories`: Create category.
  - `GET /api/products`, `POST /api/products`: Manage product catalog offerings.

- **Locations & Societies**
  - `/api/cities`: Manage city locations.
  - `/api/societies`: Manage housing societies.
  - `/api/phases`: Manage society phases and sectors.

- **Media & Files (`/api/files`, `/api/maps`, `/api/images`)**
  - Handle image uploads, floor plans, site maps, and document attachments.

- **Property Transfer Calculator Suite (`/api/calculator-*`)**
  - `/api/calculator-transfer-fees`: Manage transfer fee rules and calculations.
  - `/api/calculator-tax-rates`: Manage filer/non-filer tax rates and withholding taxes.
  - `/api/calculator-rates`: Manage base property and market rates.
  - `/api/calculator-property-types`: Manage property type classifications for calculations.
  - `/api/calculator-phases`: Manage phase-specific calculator rules.
  - `/api/calculator-fees`: Manage miscellaneous society/legal fees.
  - `/api/calculator-fee-rules`: Manage conditional fee application rules.
  - `/api/calculator-config`: Manage global calculator settings and formulas.
  - `/api/calculator-blocks`: Manage block-specific rate multipliers.

- **Content & Landing Management (`/api/landing-sections`, `/api/landing-available-items`)**
  - `GET /api/landing-sections`, `POST /api/landing-sections`: Manage homepage and landing page dynamic sections.
  - `GET /api/landing-available-items`, `POST /api/landing-available-items`: Manage spotlight items.

- **Inquiries & Leads (`/api/queries`)**
  - `GET /api/queries`: View customer contact submissions.
  - `POST /api/queries`: Submit new contact/property inquiry.

- **AI Tools & Integration (`/api/ai-tools`)**
  - `POST /api/ai-tools`: Bridge requests for AI assistant and knowledge synchronization.

- **Authentication & Users (`/api/auth`, `/api/users`, `/api/roles`, `/api/invites`)**
  - `POST /api/auth/login`: Authenticate user session.
  - `GET /api/users`: List administrative users.
  - `GET /api/roles`: Role-based permission management.
  - `POST /api/invites`: Manage team invitations.
