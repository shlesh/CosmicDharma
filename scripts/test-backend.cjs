const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const backendDir = path.join(repoRoot, "backend");
const python = process.platform === "win32"
  ? path.join(backendDir, "venv", "Scripts", "python.exe")
  : path.join(backendDir, "venv", "bin", "python");

if (!fs.existsSync(python)) {
  console.error("Backend venv not found at", python);
  process.exit(1);
}

const child = spawn(python, ["-m", "pytest", "-q"], {
  cwd: repoRoot,
  env: { ...process.env, PYTHONPATH: repoRoot },
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
