# SaaS Permissions Boilerplate

## Setup

1. Copy `.env.example` to `.env` and fill your DB credentials and JWT secret.
2. Run `npm install`
3. Import and run `db_schema_seed.sql` on your MySQL server (it creates the database and seed modules).
4. Start server: `npm run dev`
5. Endpoints:
   - `POST /api/plans` - create plan (with modules array)
   - `GET /api/plans` - list plans
   - `GET /api/plans/:id` - plan with modules
   - `POST /api/companies` - create company with plan_id
   - `POST /api/auth/company-login` - company login -> returns JWT
   - `GET /api/auth/me/modules` - get modules for logged in company (JWT)
   - `GET /api/companies/:id/modules` - admin: get modules for a company

