const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendDir = path.join(__dirname, "..", "backend");
const python = process.platform === "win32"
  ? path.join(backendDir, "venv", "Scripts", "python.exe")
  : path.join(backendDir, "venv", "bin", "python");

if (!fs.existsSync(python)) {
  console.error("Backend venv not found at", python);
  console.error("Create it with: py -3.11 -m venv backend/venv");
  process.exit(1);
}

const port = process.env.BACKEND_PORT || "8000";
const child = spawn(
  python,
  ["-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", port],
  {
    cwd: backendDir,
    env: { ...process.env, PYTHONPATH: backendDir },
    stdio: "inherit",
  }
);

child.on("exit", (code) => process.exit(code ?? 1));
