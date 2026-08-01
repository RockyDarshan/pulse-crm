# Pulse — AI Lead Qualification CRM

Built for the Volopay Growth Squad Assessment (Task 1).

**Stack:** Next.js 14 (App Router, JS) · MongoDB (Mongoose) · Google Gemini API · Tailwind CSS · deployed on Vercel.

## What it does
- Capture leads through a form (name, role, company, size, industry, current solution, budget, timeline, notes).
- On save, calls Gemini to generate: a 0–100 score, a Hot/Warm/Cold priority, reasoning, a recommended next action, and a personalised follow-up message — all tuned to a B2B spend-management ICP (see `lib/ai.js`).
- If the AI call ever fails (bad key, rate limit, network), it automatically falls back to a transparent rule-based score instead of breaking — the UI shows this happened.
- Leads persist in MongoDB. View, search, filter (by stage/priority), edit, delete, move pipeline stage, and re-run AI qualification after edits.

## Deploy in ~20 minutes

### 1. Get a free MongoDB Atlas cluster (~5 min)
1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (no card needed for the free tier).
2. Create a free **M0** cluster (any region close to India, e.g. Mumbai).
3. Under **Database Access**, create a user with a username/password.
4. Under **Network Access**, click **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`) — needed since Vercel's IPs are dynamic.
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Add a database name before the `?`, e.g. `.../pulse-crm?retryWrites=true&w=majority`

### 2. Get a free Gemini API key (~2 min)
1. Go to https://aistudio.google.com/apikey
2. Sign in with any Google account and click **Create API key**. No credit card required.
3. Copy the key.

### 3. Push this code to GitHub
```bash
cd volopay-crm
git init
git add .
git commit -m "Pulse - AI lead qualification CRM"
gh repo create pulse-crm --private --source=. --push
# (or create a repo on github.com and follow the "push an existing repo" instructions)
```

### 4. Deploy on Vercel (~5 min)
1. Go to https://vercel.com/new and import the GitHub repo you just pushed.
2. Before deploying, add environment variables (Settings → Environment Variables, or in the import screen):
   - `MONGODB_URI` = the connection string from step 1
   - `GEMINI_API_KEY` = the key from step 2
   - `GEMINI_MODEL` = `gemini-2.5-flash` (optional — this is the default)
3. Click **Deploy**. You'll get a live URL like `https://pulse-crm.vercel.app`.

### 5. Verify it's working
- Visit `https://<your-app>.vercel.app/api/health` — should show `{"mongodb":"connected","geminiKeySet":true}`.
- Add a test lead on the home page and confirm you get a score, priority, reasoning, and a follow-up message back within a few seconds.
- Refresh the page — the lead should still be there (confirms persistence).

### If the AI call fails / model name changes
Gemini's free-tier model lineup shifts fairly often. If leads come back scored by `rule-based-fallback` instead of an actual model name, open `/api/health` to confirm your key is set, then try changing `GEMINI_MODEL` in Vercel to `gemini-2.5-flash-lite` or check the current free models at https://ai.google.dev/gemini-api/docs/models — no code changes needed, just redeploy after changing the env var.

## Local development
```bash
npm install
cp .env.local.example .env.local   # fill in MONGODB_URI and GEMINI_API_KEY
npm run dev
```

## Project structure
```
app/
  page.js                    - main dashboard (search, filter, table)
  api/leads/route.js         - list (GET) + create & qualify (POST)
  api/leads/[id]/route.js    - get/edit/delete a lead
  api/leads/[id]/requalify/  - re-run AI scoring
  api/health/route.js        - env/DB check
components/                  - UI building blocks
lib/mongodb.js                - DB connection (cached for serverless)
lib/ai.js                     - Gemini prompt + rule-based fallback
lib/constants.js              - shared dropdown options, stage/priority styles
models/Lead.js                 - Mongoose schema
```
