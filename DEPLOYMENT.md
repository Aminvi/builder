# BuildPro deployment checklist

## 1. Put the project on GitHub

Create a private GitHub repository and push this project.

```bash
git init
git add .
git commit -m "Prepare BuildPro for production"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/buildpro.git
git push -u origin main
```

Do not commit `.env.local` or real secrets.

## 2. Deploy to Vercel

In Vercel, choose **Add New → Project**, import the GitHub repository, and deploy it as a Next.js project.

Leave the framework/build settings on their detected defaults.

## 3. Add production environment variables

In Vercel → Project → Settings → Environment Variables, add:

- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = your Supabase publishable key

Set them for **Production** (and Preview/Development when needed).

After adding or changing variables, redeploy the project.

## 4. Configure Supabase Auth URLs

In Supabase → Authentication → URL Configuration:

- Set **Site URL** to your real production URL, for example `https://buildpro.example.com`.
- Add your production URL to **Redirect URLs**.
- Keep `http://localhost:3000/**` only for local development.

If you use a Vercel preview environment, add the appropriate Vercel preview URL pattern as a redirect URL.

## 5. Email confirmation

For production, keep email confirmation enabled if you want users to verify ownership of their email address. Make sure the confirmation link redirects to your production URL.

## 6. Before going live

- Create at least one real Supabase Auth user.
- Test sign in.
- Test sign out.
- Test password recovery.
- Test Projects, Finance, Procurement, Equipment, Staff & Attendance, Safety, Reports, Calendar, Settings, and weather.
- Confirm RLS policies are appropriate for your users before enabling restrictive policies.
