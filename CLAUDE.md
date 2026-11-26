# CLAUDE.md

Cosmic Dharma is a Vedic astrology web app with a Next.js 15 (pages router, React 19, Tailwind 3) frontend
and a FastAPI + SQLAlchemy backend that uses Swiss Ephemeris (`pyswisseph`). The default sidereal frame is
**Sri Yukteswar / Revati** from *The Holy Science*; see [LINEAGE.md](LINEAGE.md). That is a product decision,
not a bug, so don't "fix" it to Lahiri.

The roadmap and its current status live in [PLAN.md](PLAN.md). Read it at the start of a session and update it
when a phase item lands. [AGENTS.md](AGENTS.md) holds the older shared rules (commit style, test commands).

## Read this first: the docs are partly stale

Much of this repo was written by earlier AI agents, and README.md / SETUP.md describe things that no longer exist:
- **No Redis or RQ.** Jobs (`/profile/job`, `/jobs/{id}`) run in-process via FastAPI `BackgroundTasks`, and the
  profile cache is an in-memory TTL dict ([backend/app/services/astro.py](backend/app/services/astro.py)). Both are
  lost on restart and are not shared across workers. `tests/test_jobs.py` and `tests/test_cache.py` still target RQ
  and fakeredis.
- Trust the code over the markdown. When you find a doc that lies, fix it or note it in PLAN.md.

## Layout

```
backend/
  main.py                 FastAPI app; mounts every router twice, at /api and at /
  app/core/               config.py (config.yaml + env), db.py, auth.py (JWT), geocoder.py (Google→Nominatim)
  app/routes/             auth, profile (profile/panchanga/dasha/yogas/strengths), blog, admin
  app/services/astro.py   compute_vedic_profile(): the whole calculation pipeline + cache + job store
  app/astrology/          pure calculation modules (ayanamsa, birth_info, planets, dasha, yogas, shadbala, ...)
pages/                    Next.js routes (dashboard/, panchanga, profile, posts/, admin/, auth pages)
components/<area>/        astrology, blog, admin, dashboard, layout, ui
util/http.ts              THE fetch wrapper (prefixes `${NEXT_PUBLIC_API_BASE_URL}/api`)
util/api.ts               typed API surface (profileApi, panchangaApi, blogApi) on top of http.ts
tests/                    backend pytest suite (imports as `backend.app...`)
scripts/dev-ctl.cjs       npm run up/down/status/logs (Windows-aware); logs go to ./logs
```

`util/api/client.ts` and `types/index.ts` are a dead parallel API layer, and about a dozen components are
never imported (see PLAN.md, Phase 2). Don't build on them.

## Commands (Windows, Git Bash or PowerShell)

```bash
npm install --legacy-peer-deps                   # Node 18.18+; this machine has Node 24
npm run up / npm run down / npm run status       # start/stop both servers detached (:3000 web, :8000 api)
npm run logs                                     # tail ./logs/*.log
npm run dev                                      # foreground, both servers via concurrently

npx vitest run                                   # frontend tests (vitest 0.34, jsdom)
npx vitest run path/to/file.test.tsx             # single file
npm run test:backend                             # pytest via backend/venv (sets PYTHONPATH=repo root)
PYTHONPATH=. backend/venv/Scripts/python.exe -m pytest -q tests/test_planets.py
```

The backend venv is at `backend/venv` (Python 3.11, `Scripts/` on Windows, `bin/` in CI).
The backend runs **from inside `backend/`** (`uvicorn main:app`), which is why `main.py` imports `app.*`,
while the tests import `backend.app.*`. Keep both import roots working.

## Calculation conventions

- Sign numbers are **1-12** (Aries = 1) inside the astrology modules; `get_sign_name()` converts at the edge.
- Longitudes are sidereal degrees 0-360; `tropical_longitude` is kept alongside for reference.
- Houses default to whole-sign from Lagna. Nodes default to mean.
- Ayanamsa ids: `yukteswar` (own formula: 20°54'36" at 1894-01-01, 54"/yr), `lahiri`, `raman`, `kp`,
  `yukteswar_swiss`, `fagan_bradley`. `ProfileRequest.ayanamsa` currently doesn't accept `fagan_bradley`.
- Any change to astrology output must be checked against a reference chart (see the golden-chart tests in
  PLAN.md). Don't change numbers just because a test expects different ones; find out which side is right.
- Bump the cache key prefix (`profile:v4:`) in `astro.py` when the response shape or math changes.

## Rules for working here

- Branch: active work is on `feat/yukteswar-lineage`. `main` auto-deploys (Netlify + Hostinger over SSH) on push,
  so never push to main without asking.
- Run both test suites before committing. If a test is wrong rather than the code, fix the test and say so in
  the commit body.
- Prefer deleting dead code to adding another layer. Earlier agents tended to add parallel versions
  (three API clients, many start scripts) instead of fixing the original.
- Don't commit `backend/.env`, `.env.local`, `backend/app.db`, or `logs/`.
- Commit messages: imperative mood, subject under 72 chars (see AGENTS.md).
- Windows quirks: the repo path contains a space (`git stuff`), so quote paths. Spawned servers must be
  detached (see dev-ctl.cjs history). Windows Application Control has been seen blocking the `h3` DLL that
  `timezonefinder` imports. If imports fail with "Application Control policy has blocked this file",
  that is the OS, not the code.
