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
tests/                    backend pytest suite (imports `app.*`; pytest.ini puts backend/ on sys.path)
scripts/dev-ctl.cjs       npm run up/down/status/logs (Windows-aware); logs go to ./logs
```

Several components and hooks are still never imported (see PLAN.md, Phase 2). Check that something
imports a component before building on it.

## Commands (Windows, Git Bash or PowerShell)

```bash
npm install --legacy-peer-deps                   # Node 18.18+; this machine has Node 24
npm run up / npm run down / npm run status       # start/stop both servers detached (:3000 web, :8000 api)
npm run logs                                     # tail ./logs/*.log
npm run dev                                      # foreground, both servers via concurrently

npx vitest run                                   # frontend tests (vitest 0.34, jsdom)
npx vitest run path/to/file.test.tsx             # single file
npm run test:backend                             # pytest via backend/venv
backend/venv/Scripts/python.exe -m pytest -q tests/test_planets.py
npx tsc --noEmit                                 # typecheck; `next build` fails on any type error
```

The backend venv is at `backend/venv` (Python 3.11, `Scripts/` on Windows). CI installs
`backend/requirements-dev.txt` into a plain Python, with no venv.
There is exactly **one** import root for backend code: `app.*`, resolved from `backend/`. The server runs from
inside `backend/` (`uvicorn main:app`), and pytest.ini adds `backend` to `pythonpath`. Never import
`backend.app.*`: a second root loads every module twice, and monkeypatches silently miss.

Frontend tests: Vitest 0.34 + jsdom, with the `@/` alias and automatic JSX set in vitest.config.js, and RTL
cleanup in vitest.setup.ts. Mock `@/util/api` by named export (`apiFetch`, `fetchJson`, `blogApi`, ...).
Wrap components that use React Query or SWR in their providers (see DashboardPage.test.tsx).

## Calculation conventions

- Sign numbers are **1-12** (Aries = 1) inside the astrology modules; `get_sign_name()` converts at the edge.
- Longitudes are sidereal degrees 0-360; `tropical_longitude` is kept alongside for reference.
- Houses default to whole-sign from Lagna. Nodes default to mean.
- Ayanamsa ids: `yukteswar` (own formula: 20°54'36" at 1894-01-01, 54"/yr), `lahiri`, `raman`, `kp`,
  `yukteswar_swiss`, `fagan_bradley`. `ProfileRequest.ayanamsa` currently doesn't accept `fagan_bradley`.
- Any change to astrology output must be checked against a reference chart (see the golden-chart tests in
  PLAN.md). Don't change numbers just because a test expects different ones; find out which side is right.
- Bump the cache key prefix (currently `profile:v5:`) in `astro.py` when the response shape or math changes.
- Timezones come from `geocoder.timezone_at()` (tzfpy, which takes **lon, lat**), imported lazily.

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
  detached (see dev-ctl.cjs history). `python3` is the Microsoft Store stub and hangs, so use
  `backend/venv/Scripts/python.exe`. SQLite URLs need Windows or relative paths, not `/c/...`.
  Console output is cp1252, so keep `print()` text ASCII in scripts.
- **Smart App Control is ON (enforcing) on this machine.** It blocks unsigned native Python extensions
  (`.pyd`) one file at a time and unpredictably: `h3` and `tzfpy` were both blocked, while older installs like
  `pydantic_core` still load. Error: "DLL load failed ... An Application Control policy has blocked this
  file". That's the OS, not the code. It means a live geocode→timezone lookup can't run locally.
  Tests stub it, so they still pass. Don't burn time on per-package workarounds; see PLAN.md.
