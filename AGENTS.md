# Guidelines for AI Contributions

This project contains a React frontend and a FastAPI backend. When the AI updates this repository, follow these instructions.

## Setup
1. Install Node dependencies with `npm install --legacy-peer-deps` (requires Node 18+).
2. Create a Python virtual environment under `backend/venv`, activate it, and install requirements:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cd ..
   ```

## Running the application
Use `npm run dev` to launch both the frontend and backend in development mode.

## Tests
Activate the virtual environment and run all tests before committing:
```bash
npm test
PYTHONPATH=. pytest -q
```
The backend tests stub external services so no API keys or internet access are required.

## Commit messages
- Use the imperative mood in the subject line (e.g., "Add feature" or "Fix bug").
- Keep the first line under 72 characters.
- Provide additional context in a body if necessary.
