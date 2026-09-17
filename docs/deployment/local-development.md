# Local Development Guide

This guide details how to set up and run the development environment locally.

---

## Prerequisites

- Node.js (v18+) and npm
- PHP (8.0+)
- Local MySQL server (e.g., XAMPP, Laragon, or standalone MySQL)
- Cloudflare `wrangler` CLI

---

## Getting Started

1. **Clone & Install Dependencies:**
   ```bash
   git clone <repository-url>
   cd thezalmimarketing
   npm install
   ```

2. **Configure Backend Database:**
   - Create a local MySQL database.
   - Update connection settings in `api/config.php`.

3. **Run Frontend Development Server:**
   ```bash
   npm run dev
   ```
   This starts the Vite development server (typically at `http://localhost:5173`).

4. **Run PHP Backend API:**
   - Start your local PHP server pointing to the project root:
     ```bash
     php -S localhost:8000
     ```
   - Ensure API endpoints are accessible at `http://localhost:8000/api/...`.

5. **Run AI Worker (Local):**
   - Navigate to the AI worker directory:
     ```bash
     cd workers/ai-worker
     ```
   - Start the local development environment using Wrangler:
     ```bash
     npx wrangler dev --env development
     ```
   - Ensure your `.env` contains `VITE_AI_API_URL=http://localhost:8787/chat`.
