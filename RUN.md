# Run Cosmic Dharma from the console

You do **not** have to rename `git stuff`. The starter now launches processes with PowerShell so a space in the path is fine.

From the repo root:

```powershell
cd "C:\Users\23shl\Downloads\git stuff\CosmicDharma"
git pull origin feat/yukteswar-lineage

npm run down
npm run up
npm run status
```

Same thing via the helper:

```powershell
.\scripts\dev.ps1 down
.\scripts\dev.ps1 up
.\scripts\dev.ps1 status
```

- Site: http://localhost:3000
- Health: http://127.0.0.1:8000/health

```powershell
npm run restart
npm run down
npm run logs
```

Renaming the folder to `git-stuff` is optional. Only do it if some other Windows tool still chokes; this app no longer needs it.
