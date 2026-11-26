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

## Phase 0: get green (start here)

Goal: `npm run test:all` passes locally and CI passes on the branch.

- [ ] Make the backend importable both ways (`app.*` from inside backend/, `backend.app.*` from the repo root).
      Simplest fix: conftest inserts `backend/` on `sys.path` before importing.
- [ ] Clean the requirements: drop the `swisseph` placeholder and duplicate lines, add `pyyaml`, and decide
      whether redis/rq/fakeredis stay.
- [ ] Rewrite `test_jobs.py` / `test_cache.py` against the in-memory job store and cache, or delete them.
- [ ] Fix the frontend test import paths, then fix or delete each stale assertion (one at a time; decide
      whether the test or the component is right).
- [ ] CI: the Node and Python versions match local, and pip installs requirements-dev.

## Phase 1: correctness and security

- [ ] **Golden charts:** 3-5 known birth data sets with planet and lagna longitudes, nakshatra, and dasha dates
      checked against Jagannatha Hora (or similar) using Lahiri, plus the same charts using Yukteswar.
      Tolerance about 1 arcminute. This is the most valuable test the project can have.
- [ ] Fix #5 (server sets `is_donor`), #6 (fail hard on a missing SECRET_KEY when not in dev; no admin/admin
      outside dev), #7, and #8.
- [ ] Geocoder: a real Nominatim user agent, rate limiting, and caching results to the DB instead of only an
      `lru_cache`.
- [ ] Accept `fagan_bradley` in `ProfileRequest`, or drop it from LINEAGE.md.

## Phase 2: cleanup

- [ ] Delete the dead frontend layer (client.ts, types/index.ts, unused components and hooks) and pick one
      `types` source.
- [ ] Collapse the scripts to `dev-ctl.cjs` + `dev-backend.cjs` + `test-backend.cjs` (+ one bash setup script
      for Linux/CI).
- [ ] Rewrite the README and merge in SETUP.md and RUN.md; document the real architecture.
- [ ] Decide between /api and root mounting, keep one, and drop the other (the frontend uses /api).
- [ ] Prune the stale `codex/*` remote branches.

## Phase 3: product

Pick a direction before building. Candidates:
- **Saved charts:** a `Chart` table per user; the dashboard lists saved charts (fixes #10).
- **Readable report:** a narrative reading assembled from the existing interpretations, exportable as a PDF.
  This could be the donor perk, since today the donor "prompts/reports" endpoints just store text.
- **Daily panchanga** for a saved location, as the home screen for returning users.
- **Deploy:** a Netlify Next runtime build through the git integration (fixes #11), Postgres on the API host,
  and Alembic migrations instead of `create_all`.

## Log

- 2026-11-26: repo audit; CLAUDE.md and this plan created.
