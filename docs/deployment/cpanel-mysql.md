# cPanel & MySQL Production Deployment

This guide outlines the process for deploying the web application to a production cPanel and Apache web hosting environment.

---

## Prerequisites

- PHP 8.0 or higher with PDO and MySQL extensions enabled.
- MySQL / MariaDB database.
- Apache web server with `mod_rewrite` enabled.

---

## Deployment Steps

1. **Database Setup:**
   - Create a MySQL database and user via cPanel MySQL Database Wizard.
   - Import the schema SQL dump into the database.
   - Update database credentials in `api/config.php`.

2. **Backend Upload:**
   - Upload the `api/` directory and `.htaccess` configuration to the public HTML or application root directory.
   - Ensure directory permissions for uploads and logs are properly set (`755` for directories, `644` for files).

3. **Frontend Build & Deployment:**
   - Run `npm run build` locally or in your CI/CD pipeline to generate production static assets in `dist/`.
   - Upload the contents of `dist/` to the public web root.

4. **Apache Rewrite Rules (`.htaccess`):**
   - Ensure Apache correctly routes API requests to `api/index.php` and frontend routes to index.html.
