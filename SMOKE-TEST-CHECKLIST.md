# BuildPro Smoke Test Checklist

Use this after every deployment.

- [ ] `/login` opens when signed out.
- [ ] Existing user can sign in.
- [ ] Invalid password shows an error and does not get stuck.
- [ ] Dashboard opens after login.
- [ ] Header shows the signed-in account.
- [ ] Sign out immediately redirects to `/login`.
- [ ] Signed-out `/` redirects to `/login`.
- [ ] Signed-out `/api/*` returns 401.
- [ ] Projects load from Supabase.
- [ ] Finance loads from Supabase.
- [ ] Procurement loads from Supabase.
- [ ] Equipment loads from Supabase.
- [ ] Staff directory loads from Supabase.
- [ ] Attendance can be recorded for today.
- [ ] Attendance history remains available for earlier dates.
- [ ] Safety module loads and records remain visible.
- [ ] `/api/health` is HTTP 200 while signed in.
- [ ] `npm run check` passes.
- [ ] `npm run build` passes.
