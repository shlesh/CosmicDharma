# Cosmic Dharma: plan

Status as of 2026-11-26. Everything is merged into `main`, which is the only branch.

## Where things stand

**Working:** the calculation pipeline (Yukteswar ayanamsa, lagna, planets, Vimshottari dasha, D-charts, yogas,
shadbala, ashtakavarga, panchanga, yuga clock), the night-sky UI, the dashboard, the panchanga page, the blog,
JWT auth, and the Windows `npm run up/down` tooling.

**Broken or risky:**

| # | Problem | Where |
|---|---------|-------|
| 1 | Backend tests can't load: `conftest` imports `backend.main`, which does `from app...` (same on `main`, so CI and the deploy workflow are red there too) | tests/conftest.py, backend/main.py |
| 2 | 12 of 17 frontend test files fail: stale import paths after the components moved into subfolders, plus stale text assertions | components/**/*.test.tsx |
| 3 | `tests/test_jobs.py` and `tests/test_cache.py` test RQ/Redis, which the code no longer uses | tests/ |
| 4 | `requirements.txt` lists the placeholder `swisseph` package next to `pyswisseph` and duplicates entries; `pyyaml` (imported by config.py) only appears in requirements-dev | backend/requirements*.txt |
| 5 | **Security:** `/register` accepts `is_donor: true` from the client, so anyone can grant themselves donor access | backend/app/routes/auth.py |
| 6 | **Security:** a missing `SECRET_KEY` silently generates a random key (in prod, every restart logs everyone out); the seed script creates `admin/admin` | core/auth.py, seed_demo.py |
| 7 | Any logged-in user can create blog posts; check that this is intended | routes/blog.py |
| 8 | 500 responses echo `str(e)` to the client | routes/profile.py |
| 9 | Jobs and cache live in memory: lost on restart, not shared across workers | services/astro.py |
| 10 | Charts are saved only in the browser's localStorage; nothing is saved to the user's account | pages/dashboard/index.tsx |
| 11 | Deploy workflow runs `netlify deploy --dir=.next`, which doesn't serve a Next SSR app correctly | .github/workflows/deploy.yml |
| 12 | Dead code: `util/api/client.ts`, `types/index.ts`, ~12 unused components and hooks, 8 overlapping start scripts, and README/SETUP/RUN docs that describe Redis | various |
| 13 | No reference-chart tests, so nobody has verified that the numbers match established software | tests/ |

## Phase 0: get green (done 2026-11-26)

Goal: both suites pass locally, CI passes on the branch, and `next build` succeeds.

- [x] Single backend import root (`app.*`, via pytest.ini `pythonpath = backend`). Items 1 and 3 are fixed.
- [x] Requirements cleaned and pinned; redis/rq/fakeredis dropped; timezonefinder → tzfpy. Item 4 is fixed.
- [x] Frontend tests repaired (27 pass); backend 89 pass. Item 2 is fixed.
- [x] CI split into frontend and backend jobs on Node 20 / Python 3.11.
- [x] `tsc --noEmit` clean (26 errors fixed); `components/ui/Index.ts` → `index.ts`, which broke Linux builds.
- [x] `next build` passes (16 routes). It was failing on @uiw/react-md-editor's global CSS (now in
      transpilePackages) and on `pages/profile.test.tsx`, which Next treated as a route. CI now runs the build.
- [x] `package-lock.json` is committed (the lockfile that produced the tested local node_modules; it includes
      the Linux SWC binaries). CI uses `npm ci` with the npm cache.
- [x] Bundle size: the admin tools, editor, and Chart.js are lazy-loaded. /dashboard went from 683 to 320 KB of
      first-load JS, and /admin from 627 to 187 KB.
      There are also two markdown editors (MDXEditor and @uiw/react-md-editor); keep one.
- [x] CI passes on GitHub (frontend, backend, and a Linux Netlify build job).

Real bugs fixed along the way: Saturn's ashtakavarga had an extra bindu (40, should be 39); admin edit-post
always returned 500; admin new-post POSTed to a route that doesn't exist; getPostById hit the slug route;
`/admin/posts/new` declared `create` twice, so it couldn't compile; `/editor` imported a missing
`getCurrentUser`, so it always bounced to /login; the post excerpt was sent as `summary` and dropped;
the seed script was broken three ways.

## Local environment (resolved 2026-11-26)

Smart App Control was blocking unsigned native Python extensions (h3, tzfpy), so the backend couldn't
resolve timezones. The user turned SAC off, no restart was needed, and a full live chart now computes
locally. CI is green on GitHub too.

- [x] `npm run up` hung on Windows (Next inherited the PowerShell stdout pipe that spawnSync read the pid
      from). The pid now comes back through a temp file with `stdio: 'ignore'`. Verified: start returns in
      about 10 s, and status, stop, and start all work.

## Phase 1: correctness and security

- [x] **Reference charts** (tests/test_reference_charts.py): 3 charts (Honolulu 1961, San Francisco 1955,
      Prayagraj 1917). All 7 planets are checked against NASA JPL Horizons (worst 0.86″), the ascendant against
      the Meeus textbook formula (worst 14″), plus local→UT conversion including India's 1917 offset. Nakshatra,
      pada, and birth dasha are derived independently from the JPL Moon in both the Lahiri and Yukteswar frames.
      Astro-Databank blocks automated access, so it wasn't used.
- [ ] Dasha year length: we use the Julian year (365.25 days). Some traditions use 365.2422 (tropical) or 360
      (savana). The difference is small at birth but grows across a 120-year cycle. Consider making it an option.
- [ ] Births before standard time (local mean time, e.g. India before 1906) depend on tzdata's LMT entry for
      the zone, not the actual birthplace's longitude. Add a "local mean time" input for historical charts.
- [x] #5: `/register` ignores privilege fields; admins grant donor status via
      `PATCH /admin/users/{username}/donor` (the Make/Remove donor button in the admin users list).
- [x] #6: `APP_ENV` (default `production`). Production refuses to start without a 32+ character SECRET_KEY.
      `backend/.env` is now actually loaded (it was silently ignored before). The demo seed refuses outside
      development. `create_users.py`, which reset any existing admin's password to "admin", and the broken
      `init_db.py` are deleted.
- [x] #7: only admins can create posts (POST /posts returns 403 otherwise); the /editor page says so.
- [x] #8: 500s return generic messages (details only in the log). Routes no longer turn our own 4xx errors
      into 500s, and the job status no longer sends Python tracebacks to the browser.
- [x] Geocoder: Nominatim gets an identifying User-Agent (`NOMINATIM_USER_AGENT`) and requests are throttled to
      1 per second, per OSM policy.
- [ ] Geocoder: cache results in the DB instead of only an in-process `lru_cache`.
- [x] `fagan_bradley` is accepted by the API, as LINEAGE.md promises (tested for every documented ayanamsa).
- [x] **Use the coordinates the user picked.** Profile and panchanga requests now accept `lat`/`lon`
      (validated, both or neither). When present, geocoding is skipped, and the cache keys on the
      coordinates. The panchanga page now sends them too.
- [x] The register page's "support as a donor" checkbox is gone.
- [x] The custom 422 handler crashed on ValueError-based validators, so "birth date cannot be in the
      future" showed users "Internal server error". It now uses `jsonable_encoder`.
- [x] `PUT /posts/{id}` set the title before checking whether it changed, so the slug never updated. Fixed.
- [ ] Shadbala kala bala is partial (nathonnata, paksha, and vara only; no tribhaga, abda, masa, hora, ayana,
      or yuddha). Complete it or label it as approximate in the UI.
- [ ] `GOOGLE_MAPS_API_KEY` does nothing: the `googlemaps` package isn't in requirements.
- [x] ProfileForm labels are linked to their inputs, and field errors are tied to their fields (aria-invalid + aria-describedby).
- [x] Toasts have kinds: success (green, role=status) and error (red, role=alert, the default).

## Phase 2: cleanup

- [x] Deleted the dead frontend layer: client.ts, types/index.ts, Navbar, LandingPage, ErrorBoundary,
      GlassCard, LocationSearch, DashboardLayout, PageHead, DatePicker, TimePicker, LoadingStates, and
      hooks/useForm.
- [x] Scripts are down to `dev-ctl.cjs`, `dev-backend.cjs`, `test-backend.cjs`, `start-frontend.cmd`, and
      `dev.ps1`. Removed: script.sh (1,250 lines, which called a seed module that doesn't exist), quick-*,
      fix-backend, test-setup, .run-*.sh (including the RQ worker), start-backend.cmd, and redis.conf.example.
- [x] Rewrote the README (it absorbed SETUP.md and RUN.md, which are deleted) and corrected AGENTS.md
      (`npm test` starts Vitest in watch mode, so an agent following it would hang).
- [ ] `AYANAMSA` / `NODE_TYPE` / `HOUSE_SYSTEM` in config.yaml and .env are never read; the defaults are hard-coded
      in `ProfileRequest`. Wire them up or delete them.
- [x] Postgres driver: psycopg 3 is in requirements; CI runs the backend suite on Postgres 16 too.
- [ ] Decide between /api and root mounting, keep one, and drop the other (the frontend uses /api).
- [x] Pruned every merged or abandoned branch (21, including the old `codex/*` ones); closed PRs keep their commits.
- [ ] The dashboard page still uses the old gray/white theme, not the night-sky one.

## Phase 3: product

Pick a direction before building. Candidates:
- **Saved charts:** a `Chart` table per user; the dashboard lists saved charts (fixes #10).
- **Readable report:** a narrative reading assembled from the existing interpretations, exportable as a PDF.
  This could be the donor perk, since today the donor "prompts/reports" endpoints just store text.
- **Daily panchanga** for a saved location, as the home screen for returning users.
- **Deploy (direction agreed 2026-11-26):** frontend on Netlify through its git integration and Next runtime
  (fixes #11), at `cosmicdharma.app`; the domain stays registered at Hostinger, with DNS pointed at Netlify.
  The backend can't run on Hostinger's cheapest (shared) tier, so host it on Render, Railway, or Fly.io at
  `api.cosmicdharma.app` via CNAME, with managed Postgres (Neon or Supabase), since those hosts usually wipe
  the local disk on redeploy. Check current free-tier limits first; free tiers sleep when idle. Alembic
  migrations instead of `create_all`. Rewrite deploy.yml, which assumes SSH + systemctl on a VPS.

## Log

- 2026-11-26: repo audit; CLAUDE.md and this plan created.
- 2026-11-26: Phase 0. Both suites green (89 backend, 27 frontend), tsc clean, 9 real bugs fixed, and the
  Smart App Control blocker found.
- 2026-11-26: Netlify is live. The frontend deploys from `main` with the Next runtime. Every deploy had failed
  because Netlify refuses to upload a server function built with a Next.js version that has CVE-2025-55182
  (15.3.4), so Next was upgraded to 15.5.29. DNS for cosmicdharma.app is on Netlify DNS; the HTTPS
  certificate still has to be issued. Still open: hosting the backend, then setting `NEXT_PUBLIC_API_BASE_URL`.
- 2026-11-26: Backend hosting chosen: Render free web service (render.yaml, Singapore) + Neon free Postgres.
  Railway/Fly/Koyeb no longer have real free tiers. Fixed password reset on Postgres (aware vs naive
  datetimes raised TypeError). keep-alive.yml pings /health every 10 min once the API_URL variable is set.
  deploy.yml (SSH/systemctl) deleted. Remaining for go-live: the user creates the Neon and Render accounts.
