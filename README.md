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
