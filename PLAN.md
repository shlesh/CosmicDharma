# Cosmic Dharma: plan

Status as of 2026-11-26, branch `feat/yukteswar-lineage` (30 commits ahead of `main`).

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
- [ ] Commit `package-lock.json`. It's gitignored today, so CI and Netlify resolve fresh versions on every
      install (the same drift that broke the backend). Regenerate it on Linux (CI or WSL) so it includes Linux
      optional deps, then switch CI to `npm ci` with `cache: npm`.
- [ ] Bundle size: /dashboard and /admin each load ~650 KB up front (MDXEditor + Chart.js). Lazy-load them.
      There are also two markdown editors (MDXEditor and @uiw/react-md-editor); keep one.
- [ ] Confirm CI passes on GitHub after the next push.

Real bugs fixed along the way: Saturn's ashtakavarga had an extra bindu (40, should be 39); admin edit-post
always returned 500; admin new-post POSTed to a route that doesn't exist; getPostById hit the slug route;
`/admin/posts/new` declared `create` twice, so it couldn't compile; `/editor` imported a missing
`getCurrentUser`, so it always bounced to /login; the post excerpt was sent as `summary` and dropped;
the seed script was broken three ways.

## Blocker: local backend on this PC

Smart App Control is enforcing, and it blocks unsigned native Python extensions, unpredictably (h3 and
tzfpy so far). Tests pass because they stub geocoding, but a real chart request can't resolve a timezone
locally. Options, in the user's hands:
1. **WSL2 (recommended):** develop inside Ubuntu, where SAC doesn't apply and the setup matches the
   Linux hosting. Keep the repo in the WSL filesystem.
2. Turn SAC off (Windows Security → App & browser control). This is one-way: re-enabling needs a Windows
   reset.
3. Docker / the existing .devcontainer (Docker Desktop runs on WSL2 anyway).

## Phase 1: correctness and security

- [ ] **Golden charts:** 3-5 known birth data sets with planet and lagna longitudes, nakshatra, and dasha dates
      checked against Jagannatha Hora (or similar) using Lahiri, plus the same charts using Yukteswar.
      Tolerance about 1 arcminute. This is the most valuable test the project can have.
- [ ] Fix #5 (server sets `is_donor`), #6 (fail hard on a missing SECRET_KEY when not in dev; no admin/admin
      outside dev), #7, and #8.
- [ ] Geocoder: a real Nominatim user agent, rate limiting, and caching results to the DB instead of only an
      `lru_cache`.
- [ ] Accept `fagan_bradley` in `ProfileRequest`, or drop it from LINEAGE.md.
- [ ] **Use the coordinates the user picked.** ProfileForm sends lat/lon from autocomplete, but
      ProfileRequest has no such fields, so the backend re-geocodes the label text and can land on a
      different place.
- [ ] The register page has an "I want to support as a donor" checkbox that grants donor status for free
      (this is item 5 seen from the UI). Remove it; donor status should come from an actual payment or admin.
- [ ] `PUT /posts/{id}` sets the title before checking whether it changed, so the slug never updates.
- [ ] Shadbala kala bala is partial (nathonnata, paksha, and vara only; no tribhaga, abda, masa, hora, ayana,
      or yuddha). Complete it or label it as approximate in the UI.
- [ ] `GOOGLE_MAPS_API_KEY` does nothing: the `googlemaps` package isn't in requirements.
- [ ] ProfileForm labels aren't linked to their inputs (no htmlFor/id), so screen readers can't announce them.
- [ ] Toasts are always red, success included.

## Phase 2: cleanup

- [ ] Delete the dead frontend layer (client.ts, types/index.ts, unused components and hooks) and pick one
      `types` source.
- [ ] Collapse the scripts to `dev-ctl.cjs` + `dev-backend.cjs` + `test-backend.cjs` (+ one bash setup script
      for Linux/CI).
- [ ] Rewrite the README and merge in SETUP.md and RUN.md; document the real architecture.
- [ ] Decide between /api and root mounting, keep one, and drop the other (the frontend uses /api).
- [ ] Prune the stale `codex/*` remote branches.
- [ ] Still-unused frontend files: LocationSearch, DashboardLayout, PageHead, DatePicker, TimePicker,
      LoadingStates, hooks/useForm. (Navbar, LandingPage, ErrorBoundary, GlassCard, util/api/client.ts,
      and types/index.ts are already deleted.)
- [ ] scripts/script.sh (1,100+ lines) calls a `scripts.seed_db` module that doesn't exist; seeding is
      `backend/seed_demo.py`.
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
