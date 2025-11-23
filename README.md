# Flask Backend + Admin Dashboard (Products & Articles)

## Overview
- Backend: Flask API with JWT auth, bcrypt, SQLite (default) or MySQL.
- Frontend: Simple admin dashboard (HTML/CSS/JS) under `frontend/admin/` protected via JWT.
- Public product page: `frontend/public/product.html` fetches product by `?id=` or `?slug=` via `/api/products/<id_or_slug>`.

## Project Structure
- backend/
  - app/
    - __init__.py (app factory)
    - config.py (env-driven)
    - extensions.py (db, migrate, bcrypt, jwt, cors)
    - models.py (Admin, Product, Article, AuditLog)
    - routes/ (auth, products, articles, upload)
    - utils.py (sanitize, markdown, uploads)
  - wsgi.py
  - requirements.txt
  - .env.example
  - seed_admin.py
- frontend/
  - admin/ (login, dashboard, products, product-edit, articles, article-edit)
  - public/product.html (public product detail)

## Environment Variables
- SECRET_KEY
- JWT_SECRET
- DATABASE_URL (e.g., `sqlite:///app.db` or `mysql+pymysql://user:pass@host:3306/dbname`)
- CORS_ORIGINS (default *)
- UPLOAD_FOLDER (default `backend/uploads`)
- ADMIN_USERNAME (optional for seeding)
- ADMIN_PASSWORD (optional for seeding)

## Local Setup
1. Python 3.10+
2. cd backend
3. python -m venv .venv && .venv\Scripts\activate (Windows)
4. pip install -r requirements.txt
5. Copy `.env.example` to `.env` and set values
6. Initialize DB and admin:
   - python seed_admin.py
7. Run dev server:
   - python wsgi.py
8. Admin panel:
   - Open `frontend/admin/login.html` via a static server or VSCode Live Server
   - Login using seeded admin; requests point to `/api/...` on same origin. If serving admin on another origin, set `CORS_ORIGINS`.

## API Summary
- POST /api/auth/login -> { token }
- Products: GET /api/products, POST /api/products, GET /api/products/<id_or_slug>, PUT /api/products/<id>, DELETE /api/products/<id>
- Articles: GET /api/articles, POST /api/articles, GET /api/articles/<id_or_slug>, PUT /api/articles/<id>, DELETE /api/articles/<id>
- Upload: POST /api/upload (JWT)

## Sections JSON Schema (example)
- features: `{ "type": "features", "items": ["line1", "line2"] }`
- specs: `{ "type": "specs", "rows": [{"label":"Weight","value":"2kg"}] }`
- gallery: `{ "type": "gallery", "images": ["/uploads/....jpg"] }`
- html: `{ "type": "html", "html": "<p>Custom block</p>" }`

## Security Notes
- Passwords hashed with bcrypt.
- All admin routes require `Authorization: Bearer <token>`.
- Content should be sanitized on render. Use `app/utils.py` if you add markdown rendering on the server side.

## Hostinger Deployment
1. Create a Python App (Gunicorn) in Hostinger panel.
2. Upload `backend/` folder (via File Manager/FTP). Set the working directory to `backend/`.
3. Create and set environment variables in Hostinger (Settings -> Environment):
   - SECRET_KEY, JWT_SECRET, DATABASE_URL, UPLOAD_FOLDER, CORS_ORIGINS
4. Install dependencies:
   - pip install -r requirements.txt --target ./venv_site (or panel-managed venv)
5. App entry point:
   - WSGI module: `wsgi:app`
   - Command (if needed): `gunicorn -w 2 -b 0.0.0.0:5000 wsgi:app`
6. Database:
   - For SQLite: ensure write permissions to the `backend/` folder.
   - For MySQL: create DB in Hostinger, set `DATABASE_URL=mysql+pymysql://user:pass@host:3306/db`.
7. Seed admin:
   - Temporarily run: `python seed_admin.py` from the backend directory (via SSH/Terminal in panel).
8. Static files:
   - Serve `frontend/admin/` and `frontend/public/` via Hostinger static hosting (or map to a subdomain). Ensure paths call the API origin.
9. Uploads:
   - Ensure `UPLOAD_FOLDER` directory exists and is writable. Files are served via `/uploads/<filename>`.

## Notes
- Pagination params: `page`, `per_page` (max 100). Search via `q`. Filters: `category`, `published=true|false`.
- Public product page reads `?id` or `?slug` and reflects latest content immediately from API.
