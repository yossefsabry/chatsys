# NeoChat — Vercel + Supabase Setup Guide

This branch deploys NeoChat fully to Vercel (free) using Supabase as the backend (database, real-time, and image storage).

---

## Architecture

```
React (Vite) → deployed on Vercel (static)
Supabase     → PostgreSQL + Realtime + Image Storage (all free)
```

No Express server. No Socket.io. Everything runs serverless.

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free, no credit card)
2. Click **New Project** → fill in name and password → wait ~2 minutes for setup
3. Go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## Step 2: Run the Database Schema

1. In your Supabase project, go to **SQL Editor → New Query**
2. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Click **Run** — this creates the tables, indexes, RLS policies, and storage bucket

---

## Step 3: Deploy to Vercel

1. Push this branch to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
3. Set the **branch** to `vercel-deploy`
4. Add **Environment Variables**:
   ```
   VITE_SUPABASE_URL      = https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
5. Click **Deploy** — Vercel auto-detects `vercel.json` and builds the client

---

## Step 4: Done!

Your app will be live at `https://your-project.vercel.app`.

Share a workspace URL with anyone — they can join and chat in real time.

---

## Local Development (this branch)

```bash
# 1. Copy env template
cp client/.env.example client/.env

# 2. Fill in your Supabase credentials in client/.env

# 3. Run the dev server
cd client && npm run dev
```

> The local version (`master` branch) uses Express + Socket.io + SQLite and does not need Supabase.

---

## Free Tier Limits

| Service | Free Limit |
|---|---|
| Vercel | Unlimited deployments, 100GB bandwidth/month |
| Supabase DB | 500MB PostgreSQL storage |
| Supabase Realtime | 200 concurrent connections |
| Supabase Storage | 1GB image storage |
