# Vedic Astrology App

This project contains a Next.js frontend and a FastAPI backend used to generate Vedic astrology profiles.

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

### Backend configuration

The backend reads several environment variables for its settings:

* `DATABASE_URL` – connection string for the database. By default it uses
  `sqlite:///./app.db`, creating `app.db` inside `backend/`.
* `SECRET_KEY` – secret used to sign authentication tokens.
* `ACCESS_TOKEN_EXPIRE_MINUTES` – token lifetime in minutes (defaults to `30`).

To seed the database with demo accounts and posts run:

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

The frontend runs on port 3000 and uses environment variables to reach the backend on port 8000.

## Tests

### Frontend

Run the frontend unit tests with Vitest:

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

1. Set the `NEXT_PUBLIC_API_BASE_URL` variable in Netlify to the full URL of your backend (e.g. `https://api.cosmicdharma.app`).
2. Connect this repository to Netlify so pushes to `main` trigger a build. Netlify uses `npm run build` and publishes the `.next` directory as defined in `netlify.toml`.
3. Point your `cosmicdharma.app` domain to Netlify and add it as a custom domain in the Netlify dashboard.
4. GitHub Actions deploy the backend over SSH and trigger a Netlify deploy using the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets.

