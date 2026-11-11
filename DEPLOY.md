# Deploying this app for free

Stack: **FastAPI backend** (stateless, no database) + **static Next.js frontend** (`output: "export"`).

Recommended free hosts: **Render** (backend) + **Vercel** (frontend).

---

## 0. Prerequisites

1. Commit and push the repository to GitHub (Render and Vercel deploy from git).
   `.gitignore` already excludes `venv/`, `node_modules/`, `.next/`, `out/`,
   `pdf_pages/`, tests and media — nothing extra to clean.
2. No secrets are needed; the API is public and CORS already allows any origin.

---

## 1. Backend — Render (free)

A blueprint file `render.yaml` is included, so this is one click:

1. Go to <https://dashboard.render.com> → **New + → Blueprint**.
2. Select your GitHub repository. Render reads `render.yaml` and creates:
   - service name: `kundalireport-api`
   - build: `pip install -r requirements.txt` (in `backend/`)
   - start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - health check: `/api/health`
3. Click **Apply**. After the first build you get a URL like
   `https://kundalireport-api.onrender.com` — test
   `https://<your-url>/api/health` in a browser.

**Free tier behaviour:** the service sleeps after ~15 min without traffic;
the first request after a sleep takes ~30–60 s (cold start). Subsequent
requests are fast. For an app used occasionally by a small group this is
the right trade for ₹0 — no keep-alive ping is needed (a 24/7 pinger would
consume ~730 of the 750 free monthly instance-hours just to avoid that
occasional one-minute wait). If usage ever grows, the $7/month tier
removes cold starts entirely.

---

## 2. Frontend — Vercel (free)

`NEXT_PUBLIC_API_URL` is baked into the static export **at build time**,
so it must exist before the build runs.

1. Go to <https://vercel.com/new> and import the same repository.
2. **Root Directory**: `frontend` (Vercel detects the Next.js preset).
3. **Environment Variables** (add before deploying):
   - `NEXT_PUBLIC_API_URL` = `https://kundalireport-api.onrender.com`
     (your Render URL from step 1, without a trailing slash)
4. Deploy. Vercel runs `next build`; with `output: "export"` the static
   `out/` folder is served automatically with HTTPS.

If you add the env var after the first deploy, trigger **Redeploy** so the
value is baked in.

---

## 3. Verify

- Open the Vercel URL.
- Generate a birth chart (first load may take ~1 min if the Render service
  was asleep).
- The print pages (`/print/janma`) work in the browser: use the page's
  **Print** button (browser `Save as PDF`). Playwright-based bulk PDF
  generation stays a local workflow and is not needed on the server.

---

## Alternative free hosts (if you prefer)

| Piece | Alternatives |
|---|---|
| Backend | Hugging Face Spaces (Docker), Koyeb free tier, Oracle Cloud Always Free VPS (always-on, needs credit card) |
| Frontend | Netlify, Cloudflare Pages, GitHub Pages (all serve the static `out/` build) |
