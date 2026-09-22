# BuildPro — Production Readiness

## Current baseline
This package is based on the stable Staff & Attendance baseline and the completed authentication/reliability work.

Removed by design:
- CCTV
- Documents
- Site Updates

Preserved:
- Dashboard / Projects
- Finance
- Procurement
- Equipment
- Staff & Attendance
- Safety
- Reports
- Calendar
- Notifications
- Settings

## Before deployment
1. Set `NEXT_PUBLIC_SUPABASE_URL`.
2. Set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Create at least one Supabase Auth user.
4. Confirm `/login` works with the production Supabase project.
5. Run the RLS SQL only after authenticated API requests have been verified.
6. Confirm the following smoke tests:
   - login
   - sign out redirects immediately to `/login`
   - projects load and update
   - finance loads
   - procurement loads
   - equipment loads and edits
   - staff directory loads and edits
   - today's attendance can be recorded
   - attendance history opens for an earlier date
   - safety records load
   - `/api/health` returns HTTP 200 while authenticated
7. Run `npm run check` before deployment.
8. Run `npm run build` in an environment with network access to the required Next.js compiler binary.

## Health check
While signed in, open:
`/api/health`

Expected response fields include:
- `ok: true`
- `authenticated: true`
- the signed-in email
- `supabaseAuthReachable: true`

## Security headers
The app now adds basic browser security headers through `next.config.ts`.

## Important
Do not commit `.env.local`. Use the hosting provider's environment-variable settings for production secrets and public Supabase configuration.
