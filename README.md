# Vedic Astrology App

This project contains a React frontend and a FastAPI backend used to generate Vedic astrology profiles.

## Setup

### Install Node dependencies

```bash
npm install
```

### Setup Python environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### Configure the database

By default the backend uses SQLite. The database file `app.db` will be created in `backend/`. To use another database provide the `DATABASE_URL` environment variable (e.g. `postgresql://user:pass@localhost/dbname`). Authentication tokens are encrypted with `SECRET_KEY` and their lifetime can be adjusted with `ACCESS_TOKEN_EXPIRE_MINUTES`.

### Seed sample data

Populate the local SQLite database with demo users and posts:

```bash
python backend/seed_demo.py
```

This creates two accounts:
* **admin** / **admin** – full admin access
* **user** / **password** – regular account with one post

## Running the application

Start both servers in development mode:

```bash
npm run dev
```

The frontend runs on port 3000 and proxies API requests to the backend on port 8000.

## Tests

### Frontend

Run the React unit tests with Vitest:

```bash
npm test
```

### Backend

Execute the FastAPI tests using pytest:

```bash
PYTHONPATH=. pytest -q
```

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

1. Set the `VITE_API_BASE_URL` variable in Netlify to the full URL of your backend (e.g. `https://api.cosmicdharma.app`).
2. Connect this repository to Netlify so pushes to `main` trigger a build. Netlify uses `npm run build` and publishes the `dist` directory as defined in `netlify.toml`.
3. Point your `cosmicdharma.app` domain to Netlify and add it as a custom domain in the Netlify dashboard.
4. GitHub Actions deploy the backend over SSH and trigger a Netlify deploy using the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets.

## Next.js prototype

A lightweight Next.js project is included under `next-prototype` to demonstrate how the existing React components work in a static site.

- **Dynamic API calls** – the page in `pages/index.js` fetches chart data from the FastAPI backend using `NEXT_PUBLIC_API_BASE_URL`. Jobs are polled client side just like the Vite app.
- **Build times** – Next.js performs static generation. The build step is heavier than Vite but enables pre-rendered HTML for fast initial loads.
- **Hosting requirements** – the output can be deployed to any static hosting platform. API calls still require the FastAPI server or serverless functions.
- **SEO benefits** – rendered markup is available at build time so search engines can index the main content even before JavaScript loads.
