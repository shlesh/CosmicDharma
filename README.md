# Cosmic Dharma

Vedic astrology in the **Sri Yukteswar / Holy Science** frame. Birth charts with D1–D60 vargas, Vimshottari
dasha, yogas, shadbala, ashtakavarga, a daily panchanga and the yuga clock. There's also a small Markdown blog,
an admin dashboard, and donor-only extras.

- **Frontend:** Next.js 15 (pages router), React 19, Tailwind 3
- **Backend:** FastAPI + SQLAlchemy, with [Swiss Ephemeris](https://www.astro.com/swisseph/) (`pyswisseph`) for
  the astronomy

The default sidereal frame is Sri Yukteswar's Revati ayanamsa from *The Holy Science* (1894). Lahiri, Raman,
KP and Fagan/Bradley stay selectable for comparison. See [LINEAGE.md](LINEAGE.md) for the reasoning.

## Accuracy

The engine is regression-tested against independent sources, not against itself
([tests/test_reference_charts.py](tests/test_reference_charts.py)):

- **Planets:** checked against **NASA JPL Horizons** (DE441). Worst difference: 0.86 arcseconds.
- **Ascendant:** checked against the textbook formula from Meeus's *Astronomical Algorithms*. Worst
  difference: 14 arcseconds.
- **Local time to UT:** verified, including historical offsets (India was +5:30 in 1917).
- **Nakshatra, pada and birth dasha:** derived independently from the JPL Moon, in both the Lahiri and
  Yukteswar frames.

## Quick start

You need **Node.js 20+** and **Python 3.11**.

```bash
# 1. Frontend dependencies
npm install --legacy-peer-deps

# 2. Backend virtualenv
python -m venv backend/venv                      # Windows: py -3.11 -m venv backend\venv
backend/venv/bin/pip install -r backend/requirements-dev.txt
#   Windows: backend\venv\Scripts\pip install -r backend\requirements-dev.txt

# 3. Config
cp backend/.env.example backend/.env             # already sets APP_ENV=development
cp .env.local.example .env.local                 # NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# 4. Optional: demo accounts (admin/admin, user/password, donor/donor). Development only.
backend/venv/bin/python backend/seed_demo.py     # Windows: backend\venv\Scripts\python backend\seed_demo.py

# 5. Run
npm run dev        # both servers in the foreground: web on :3000, API on :8000 (docs at /docs)
```

On Windows you can also run both servers in the background:

```powershell
npm run up         # start both, detached; logs go to ./logs
npm run status     # what's running, plus the API health check
npm run logs
npm run restart
npm run down
```

## Tests

```bash
npm run test:frontend   # Vitest + Testing Library
npm run test:backend    # pytest via backend/venv; no network or API keys needed
npm run test:all
npx tsc --noEmit        # typecheck (next build fails on any type error)
```

CI ([.github/workflows/tests.yml](.github/workflows/tests.yml)) runs the following on every pull request:

- both test suites
- `next build`
- the Netlify build itself, on Linux with Node 20

## Configuration

`backend/.env` is loaded automatically at startup, and real environment variables override it.

| Variable | Default | Notes |
|---|---|---|
| `APP_ENV` | `production` | Anything except `development`/`test` refuses to start without a strong `SECRET_KEY`. |
| `SECRET_KEY` | none | JWT signing key, 32+ random characters: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `DATABASE_URL` | `sqlite:///./app.db` | SQLAlchemy URL. Postgres also needs a driver, such as `psycopg`, which isn't installed yet. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | |
| `FRONTEND_URL` / `CORS_ORIGINS` | `http://localhost:3000` | `CORS_ORIGINS` is comma-separated and replaces the default allow-list. |
| `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` | unset | Password-reset emails. |
| `GOOGLE_MAPS_API_KEY` | unset | Only takes effect if the `googlemaps` package is installed; otherwise OpenStreetMap is used. |
| `CACHE_ENABLED`, `CACHE_TTL` | `true`, `3600` | In-memory chart cache. |
| `NOMINATIM_USER_AGENT` | `CosmicDharma/2.1` | Sent to OpenStreetMap's geocoder, whose policy asks apps to identify themselves; add a contact URL or e-mail in production. Requests are throttled to 1 per second. |

The chart defaults (Yukteswar ayanamsa, mean node, whole-sign houses) are part of the API's request model, and
each request can override them. The `AYANAMSA`, `NODE_TYPE` and `HOUSE_SYSTEM` keys in `config.yaml` are
currently **not read**.

Frontend (`.env.local`, or Netlify's environment settings):

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | The API's origin, with no trailing slash and no `/api`. It's baked in at build time. |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Optional. Switches place autocomplete from OpenStreetMap to Mapbox. |

## How it fits together

```
pages/ + components/          Next.js UI; all API calls go through util/http.ts -> {API}/api/...
backend/main.py               FastAPI app (routers mounted at /api and at /)
backend/app/routes/           auth, profile (profile, panchanga, dasha, yogas, strengths), blog, admin
backend/app/services/astro.py compute_vedic_profile(): geocode -> birth info -> planets -> every module
backend/app/astrology/        the calculations (ayanamsa, lagna, dasha, vargas, yogas, shadbala, ...)
tests/                        backend tests, including the reference charts
```

Chart jobs (`POST /api/profile/job`, then `GET /api/jobs/{id}`) and the chart cache live **in memory**. They
work on a single server process and are lost on restart. There's no Redis.

## Deployment

The plan is to serve the frontend from **Netlify** (the project is connected and builds every pull request) and
host the API separately, then point `cosmicdharma.app` at Netlify. That work is still in progress; see Phase 3
in [PLAN.md](PLAN.md). The `Deploy` GitHub workflow is manual-only until it's rewritten for the chosen backend
host.

## Troubleshooting (Windows)

- **"DLL load failed … Application Control policy has blocked this file":** Windows Smart App Control is
  blocking an unsigned Python extension. Turn it off under Windows Security → App & browser control, or develop
  in WSL2.
- **Backend changes don't show up:** uvicorn's `--reload` sometimes logs "Reloading…" but keeps the old worker
  running. Run `npm run restart`.
- The repo path can contain spaces (`git stuff`); the scripts quote everything.

## Contributing

Read [CLAUDE.md](CLAUDE.md) for conventions, and [PLAN.md](PLAN.md) for the roadmap and its current status.
Commit subjects use the imperative mood and stay under 72 characters. Run both test suites before opening a
pull request.
