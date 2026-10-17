# Zalmi staging web

This is an isolated public migration slice. It uses only synthetic fixtures and must not connect to cPanel, production MySQL, production media, or the existing PHP API.

Run locally from this directory with `npm run dev`. Build with `npm run build`.

The browser app renders a not-found page. A future Worker/host runtime must be responsible for returning the HTTP `404` status for unmatched requests.
