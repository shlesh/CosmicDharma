# Vedic Astrology App

This project contains a Next.js frontend and a FastAPI backend used to generate Vedic astrology profiles. It also features a simple blog where posts are written in Markdown, donor-only endpoints and an admin dashboard with basic metrics.

## Features

* Astrology profile generation with an optional background job queue
* Blog with a Markdown editor and admin metrics
* Donor-only prompts and reports
* Password reset functionality
* Progressive Web App support

## Setup

### Install Node dependencies

Install **Node.js 18** or later (for example via `nvm` or your package manager) and run:

```bash
npm install --legacy-peer-deps
```
Run this after cloning to install all runtime and development packages.

### Tailwind CSS

Tailwind is configured in `tailwind.config.js` and the directives are imported
in `styles/globals.css`. Next.js compiles the CSS via PostCSS so no extra build
step is required. Run `npm run dev` while developing and `npm run build` to
produce the optimized styles for production.

### Setup Python environment

Install **Python 3** and create a virtual environment under `backend/venv`:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
cd ..
```
Activate this environment whenever you run tests or start the backend.

### Backend configuration

Copy `backend/.env.example` to `backend/.env` and fill in the values. The backend
reads these environment variables:

* `DATABASE_URL` – connection string for the database. Defaults to
  `sqlite:///./app.db`.
* `SECRET_KEY` – secret used to sign authentication tokens.
* `ACCESS_TOKEN_EXPIRE_MINUTES` – token lifetime in minutes (defaults to `30`).
* `GOOGLE_MAPS_API_KEY` – optional key for Google Maps geocoding.
* `AYANAMSA` – ayanamsa used in calculations (`lahiri` by default).
* `NODE_TYPE` – lunar node calculation (`mean` or `true`).
* `HOUSE_SYSTEM` – astrological house system (`whole_sign` by default).
* `CACHE_ENABLED` – enable or disable caching.
* `CACHE_URL` – Redis URL used for the profile cache.
* `REDIS_URL` – connection string for Redis used by the background job queue
  (defaults to `redis://localhost:6379/1`).
* `CACHE_TTL` – cache lifetime in seconds.
* `SMTP_SERVER` – hostname of your SMTP server for sending email.
* `SMTP_PORT` – port of the SMTP server (`587` by default).
* `SMTP_USER` – SMTP username if authentication is required.
* `SMTP_PASS` – SMTP password for the above user.
* `FROM_EMAIL` – default sender address for outgoing mail.

For the Next.js frontend, create `.env.local` and set `NEXT_PUBLIC_API_BASE_URL`
to the URL of your backend. During local development this is usually
`http://localhost:8000`.

To seed the database with demo accounts and posts run from the repository root:

```bash
PYTHONPATH=. python backend/seed_demo.py
```

This creates two accounts:

* **admin** / **admin** – full admin access
* **user** / **password** – regular account with one post
* **donor** / **donor** – donor account with access to extra prompts and reports

### Password Reset

Use the `request-reset.tsx` page or send a `POST` to `/request-reset` with an
email address. The backend emails a token via SMTP using the `SMTP_SERVER`,
`SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `FROM_EMAIL` variables. Submit that
token to `/reset-password` (handled by `reset-password.tsx`) along with a new
password to finish the process.

## Running the application

Run the helper script during the first setup. It verifies that **Node.js 18+** and **Python 3** are available, installs dependencies, runs all tests, and then launches the frontend, backend and worker. The script checks for a local Redis instance and attempts to start one automatically. Colored status messages are printed and the script exits on any failure:

```bash
./scripts/script.sh
```

Internally it runs

```bash
npx concurrently --kill-others-on-fail "npm run dev" "npm run worker"
```

to launch the Next.js frontend, FastAPI backend and RQ worker. After the initial setup you can simply run:

```bash
npm run dev
```

to launch the frontend and backend. You may run the worker separately if you prefer:

```bash
npm run worker
```

Redis must be running locally before starting the worker. `scripts/script.sh`
tries to launch Redis automatically using Docker Compose (`docker compose` or
`docker-compose`) or `redis-server`. Ensure one of these tools is installed for
the automatic startup to succeed. If the script cannot start Redis, it continues
without the worker. Start Redis manually (for example with `docker compose up -d
redis` or `docker-compose up -d redis`) and run `npm run worker` in a separate
terminal to enable background tasks. You may also launch Redis yourself and
rerun the script.

```bash
docker compose up -d redis
# or
docker-compose up -d redis
```

Without Redis the worker exits with connection errors.

The frontend runs on port 3000 and uses environment variables to reach the backend on port 8000.
Create a `.env.local` file if it doesn't exist and set `NEXT_PUBLIC_API_BASE_URL` to the URL of the backend.
For local development use:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

To compute a profile asynchronously, send a request to `/profile/job`:

```bash
curl -X POST http://localhost:8000/profile/job \
  -H "Content-Type: application/json" \
  -d '{"date":"1990-01-01","time":"10:00","location":"New York"}'
```

This returns a job ID. Poll `/jobs/{id}` to retrieve the status:

```bash
curl http://localhost:8000/jobs/<job_id>
```

When the job completes, the response includes the generated profile data.

### Common issues

If you see `Cannot find module 'next-pwa'` when running `scripts/script.sh` or
`npm run dev`, run `npm install --legacy-peer-deps` again to ensure all
packages are installed.

## Docker Compose

You can run the backend together with Redis and Postgres using Docker
Compose. Build and start all services with:

```bash
docker compose up --build
# or
docker-compose up --build
```

This starts three containers:
* **backend** – FastAPI app from `backend/Dockerfile` on port 8000
* **redis** – caching and RQ broker on port 6379
* **db** – Postgres database on port 5432 stored in the `db_data` volume

The backend container reads environment variables from `backend/.env` so
adjust `DATABASE_URL` or `CACHE_URL` there as needed.

## Tests

Install the extra Python packages used during testing:

```bash
pip install -r backend/requirements-dev.txt
source backend/venv/bin/activate
```


Use the following scripts to run the tests:

```bash
npm run test:frontend   # frontend only
npm run test:backend    # backend only
npm run test:all        # both suites
```

Backend tests can also be run directly:

```bash
PYTHONPATH=. pytest -q
```

The `pytest.ini` file stores default options for `pytest` and Vitest outputs
coverage reports to `coverage/` when the tests run.

The backend tests stub all external dependencies so no API keys or internet access are required.

To run the backend tests inside the Docker container, build the image and mount the test suite:

```bash
docker build -f backend/Dockerfile -t backend-tests .
docker run --rm -v $(pwd)/tests:/tests backend-tests bash -c "pip install pytest && PYTHONPATH=/app pytest -q /tests"
```

## Continuous integration

Automated tests run on GitHub Actions for every push and pull request. The workflow installs Node and Python dependencies and executes both the frontend and backend test suites.

## Components

The interface is composed of several reusable React components:

- **ProfileForm** – collects your birth details. Tooltips guide each input.
- **ProfileSummary** – highlights key chart insights, such as your nakshatra.
- **BasicInfo** – confirms the birth data used in calculations.
- **CoreElements** – shows the balance of Fire, Earth, Air and Water elements.
- **PlanetTable** – lists the zodiac sign and degree of every planet.
- **HouseAnalysis** – explains how each astrological house influences life areas.
- **DashaTable** – lists major planetary periods with start and end dates.
- **DashaChart** – visual timeline of those periods; hover to read descriptions.

## Deployment

The frontend is deployed to Netlify while the FastAPI backend stays on Hostinger.

1. Set the `NEXT_PUBLIC_API_BASE_URL`, `CACHE_URL` and mail variables (`SMTP_SERVER`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`) in Netlify to match your backend configuration.
2. Netlify reads `netlify.toml` for the build command and publish directory. Those variables can also be defined in that file.
3. Connect this repository to Netlify so pushes to `main` trigger a build. Netlify installs dependencies, runs `npm run build` and uploads the `.next` directory.
4. Point your `cosmicdharma.app` domain to Netlify and add it as a custom domain in the Netlify dashboard.
5. GitHub Actions deploy the backend over SSH and trigger a Netlify deploy using the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets.
6. On the server, copy `backend/.env.example` to `backend/.env` and provide the
   production values before starting the FastAPI service.

## Progressive Web App

The app is configured as a PWA using **next-pwa**. Metadata like the name,
colors and icons live in `public/manifest.json`. Edit that file to customize
how the app looks when installed. During a production build a service worker is
created automatically. Run:

```bash
npm run build
```

and `service-worker.js` will be generated alongside the Next.js output. Static
assets are cached with a Cache First strategy and API requests with Network
First. Netlify deploys automatically serve the generated service worker.

To install the app, open the site in Chrome or Safari on mobile and choose
**Add to Home Screen** from the browser menu. On desktop browsers like Chrome or
Edge an install button appears in the address bar; click it to create a
standalone window.

## Contributing

1. Install dependencies and set up the Python virtual environment as described above.
2. Run `npm run test:all` and ensure all tests pass before opening a pull request.
3. Format any new code consistently with the existing style.
4. Write commit messages in the imperative mood, keep the subject under 72 characters and add a body if more context is needed.


Repository structure

    Backend (backend/)

        FastAPI application with endpoints for astrology profile generation and blog post CRUD operations.
        Key files: main.py, auth.py, models.py, services/astro.py, db.py.

        User model includes `is_admin` for admin-only post management and `is_donor` for donor accounts.

        SQLite or external DB configured via DATABASE_URL.

        Provides /register, /login, /posts, /admin/posts, /admin/metrics, etc.

    Frontend

        Next.js app under pages/ with React components in components/.

        Blog-related pages:

            /posts (listing), [id].tsx (view post), editor.tsx (create Markdown post with React MDE), admin.tsx (manage posts and view metrics).

            /login and /register pages for user auth.

        Util functions for API calls in util/api.ts.

        Global CSS styles in styles/.

    Configuration and tooling

        package.json with Next.js 15, React 19, React MDE for Markdown editing, and Vitest for tests.

        Python requirements and virtual environment under backend/.

        scripts/script.sh installs dependencies, runs tests and then starts both servers and the background worker.

        CI workflows in .github/workflows/.

        Netlify deploy configuration in netlify.toml.

        Tests covering backend endpoints and astrology calculations in tests/.
