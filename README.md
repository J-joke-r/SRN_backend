# Backend Environment Variables

Create a `.env` in `backend/` (or configure in Railway/Render) with:

PORT=5000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
ALLOWED_ORIGINS=
FRONTEND_URL=

- ALLOWED_ORIGINS: comma-separated, e.g. https://your-frontend.vercel.app,https://staging-frontend.vercel.app
- PORT: provided by the platform; server uses `process.env.PORT || 5000`.
