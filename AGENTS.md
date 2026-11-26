# Guidelines for AI contributions

[CLAUDE.md](CLAUDE.md) holds the full conventions (architecture, the single `app.*` import root,
environments, calculation rules, Windows quirks). [PLAN.md](PLAN.md) is the roadmap. Read both first.

## Setup
1. `npm install --legacy-peer-deps` (Node 20+).
2. `python -m venv backend/venv`, then install `backend/requirements-dev.txt` into it (that file includes
   requirements.txt, plus pytest).
3. Copy `backend/.env.example` to `backend/.env` (it sets `APP_ENV=development`).

## Running
`npm run dev` runs both servers in the foreground. `npm run up` / `npm run down` run them detached.

## Tests: run both before committing
```bash
npm run test:frontend   # not `npm test`: that starts Vitest in watch mode and never exits
npm run test:backend    # or: backend/venv/bin/python -m pytest  (pytest.ini sets the path)
npx tsc --noEmit
```
The backend tests stub geocoding and the network, so no API keys or internet access are needed.

## Commit messages
- Imperative mood in the subject line ("Add feature", "Fix bug"), under 72 characters.
- Explain the why in the body when it isn't obvious.
