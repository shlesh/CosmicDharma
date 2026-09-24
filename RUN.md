# Run Cosmic Dharma from the console

From the repo root. Works in PowerShell, cmd, and bash.

```powershell
cd "C:\Users\23shl\Downloads\git stuff\CosmicDharma"
```

## One-shot commands

```powershell
npm run up         # start frontend :3000 and backend :8000 in the background
npm run status     # are they up?
npm run restart    # stop both, then start both
npm run down       # stop both and free the ports
```

`npm run stop` is the same as `down`.

## After start

- Site: http://localhost:3000
- API health: http://localhost:8000/health
- Logs: `logs\frontend.log` and `logs\backend.log`

Tail logs in PowerShell:

```powershell
Get-Content .\logs\frontend.log -Wait
Get-Content .\logs\backend.log -Wait
```

## Foreground (logs in this window)

```powershell
npm run dev
```

Ctrl+C stops both.

## If a port is stuck

```powershell
npm run down
```

That kills whatever is listening on 3000 and 8000, not only the last PIDs we recorded.
