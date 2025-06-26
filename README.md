# Vedic Astrology App

This project contains a Next.js frontend and a FastAPI backend used to generate Vedic astrology profiles. It also features a simple blog where posts are written in Markdown, donor-only endpoints and an admin dashboard with basic metrics.

## Setup

### Install Node dependencies

Ensure you have **Node.js 18** or later installed. Install packages with:

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

To seed the database with demo accounts and posts run from the repository root:

```bash
PYTHONPATH=. python backend/seed_demo.py
```

This creates two accounts:
* **admin** / **admin** – full admin access
* **user** / **password** – regular account with one post
* **donor** / **donor** – donor account with access to extra prompts and reports

## Running the application

Run the helper script to install dependencies and launch the servers:

```bash
./scripts/dev.sh
```

After the initial setup you can simply run:

```bash
npm run dev
```
to start the Next.js frontend and FastAPI backend concurrently.

The frontend runs on port 3000 and uses environment variables to reach the backend on port 8000.

Set `NEXT_PUBLIC_API_BASE_URL` (for example in `.env.local`) to the URL of an
external backend if you want the frontend to reach it during development.

add this to .env.local(create the file if it doesnt exist)
`NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

## Tests

Install the extra Python packages used during testing and run the frontend and backend tests separately or together using NPM scripts:

```bash
pip install -r backend/requirements-dev.txt
source backend/venv/bin/activate
```

```bash
# frontend only
npm run test:frontend

# backend only
npm run test:backend

# run both suites
npm run test:all
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

1. Set the `NEXT_PUBLIC_API_BASE_URL` variable in Netlify to the full URL of your backend (e.g. `https://api.cosmicdharma.app`).
2. Netlify reads `netlify.toml` for the build command and publish directory. You can override additional environment variables in that file or in the Netlify UI.
3. Connect this repository to Netlify so pushes to `main` trigger a build. Netlify installs dependencies, runs `npm run build` and uploads the `.next` directory.
4. Point your `cosmicdharma.app` domain to Netlify and add it as a custom domain in the Netlify dashboard.
5. GitHub Actions deploy the backend over SSH and trigger a Netlify deploy using the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets.
6. On the server, copy `backend/.env.example` to `backend/.env` and provide the
   production values before starting the FastAPI service.

## Contributing

1. Install dependencies and set up the Python virtual environment as described above.
2. Run `npm run test:all` and ensure all tests pass before opening a pull request.
3. Format any new code consistently with the existing style.


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

        scripts/dev.sh bootstraps dependencies and then runs both servers.

        CI workflows in .github/workflows/.

        Netlify deploy configuration in netlify.toml.

        Tests covering backend endpoints and astrology calculations in tests/.
