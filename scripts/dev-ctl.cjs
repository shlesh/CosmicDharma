#!/usr/bin/env node
/**
 * Start, stop, restart, and status for frontend + backend.
 * No shell on Windows so paths with spaces (git stuff) stay intact.
 */
const { spawn, execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");
const net = require("net");

const ROOT = path.join(__dirname, "..");
const BACKEND = path.join(ROOT, "backend");
const LOG_DIR = path.join(ROOT, "logs");
const PID_FILE = path.join(LOG_DIR, "dev-pids.json");
const FRONT_PORT = Number(process.env.PORT || process.env.FRONTEND_PORT || 3000);
const BACK_PORT = Number(process.env.BACKEND_PORT || 8000);
const isWin = process.platform === "win32";

function ensureLogDir() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function readPids() {
  try {
    return JSON.parse(fs.readFileSync(PID_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writePids(data) {
  ensureLogDir();
  fs.writeFileSync(PID_FILE, JSON.stringify(data, null, 2));
}

function pythonBin() {
  const names = isWin
    ? ["python.exe", "python3.exe"]
    : ["python", "python3"];
  const folders = isWin ? ["Scripts"] : ["bin"];
  const venvs = ["venv", "venv311"];
  for (const v of venvs) {
    for (const folder of folders) {
      for (const name of names) {
        const p = path.join(BACKEND, v, folder, name);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
}

function nextBin() {
  const p = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  return fs.existsSync(p) ? p : null;
}

function tailLog(name, lines = 40) {
  const logPath = path.join(LOG_DIR, `${name}.log`);
  if (!fs.existsSync(logPath)) return `(no ${name}.log yet)`;
  const text = fs.readFileSync(logPath, "utf8").replace(/\r\n/g, "\n");
  const parts = text.trim().split("\n");
  return parts.slice(-lines).join("\n") || `(${name}.log empty)`;
}

function pidsOnPort(port) {
  try {
    if (isWin) {
      const out = execSync("netstat -ano", { encoding: "utf8" });
      const re = new RegExp(`[:.]${port}\\s`);
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        if (!/LISTENING/i.test(line)) continue;
        if (!re.test(line)) continue;
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (/^\d+$/.test(pid) && pid !== "0") pids.add(pid);
      }
      return [...pids];
    }
    const out = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, { encoding: "utf8" });
    return out.split(/\s+/).map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function killPid(pid) {
  if (!pid) return;
  try {
    if (isWin) execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
    else process.kill(Number(pid), "SIGTERM");
  } catch {
    /* gone */
  }
}

function killPort(port) {
  for (const pid of pidsOnPort(port)) killPid(pid);
}

function portOpen(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => {
      sock.end();
      resolve(true);
    });
    sock.on("error", () => resolve(false));
    sock.setTimeout(400, () => {
      sock.destroy();
      resolve(false);
    });
  });
}

function waitFor(port, label, ms = 30000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const tick = async () => {
      if (await portOpen(port)) return resolve(true);
      if (Date.now() - start > ms) {
        console.error(`${label} did not open on :${port} within ${ms}ms`);
        return resolve(false);
      }
      setTimeout(tick, 400);
    };
    tick();
  });
}

function spawnLogged(name, command, args, cwd, extraEnv) {
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${name}.log`);
  fs.appendFileSync(
    logPath,
    `\n----- ${new Date().toISOString()} ${command} ${args.join(" ")} -----\n`
  );
  const out = fs.openSync(logPath, "a");
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...(extraEnv || {}) },
    detached: true,
    stdio: ["ignore", out, out],
    windowsHide: true,
    shell: false,
    windowsVerbatimArguments: false,
  });
  child.unref();
  return { pid: child.pid, logPath };
}

function preflight(py) {
  const check = spawnSync(
    py,
    ["-c", "import sys,uvicorn,fastapi; print(sys.version.split()[0]); print(uvicorn.__version__)"],
    { cwd: BACKEND, encoding: "utf8" }
  );
  if (check.status !== 0) {
    console.error("Backend venv cannot import uvicorn/fastapi.");
    console.error((check.stderr || check.stdout || "").trim());
    console.error("Fix with:");
    console.error(`  "${py}" -m pip install -r "${path.join(BACKEND, "requirements.txt")}"`);
    process.exit(1);
  }
  const [pyVer, uvVer] = (check.stdout || "").trim().split(/\r?\n/);
  console.log(`Python ${pyVer}  uvicorn ${uvVer}  (${py})`);
  if (pyVer && !pyVer.startsWith("3.11")) {
    console.warn("Warning: this project expects Python 3.11 for pyswisseph wheels.");
  }
}

function start() {
  const py = pythonBin();
  if (!py) {
    console.error("No backend venv Python found under backend/venv.");
    console.error(isWin
      ? "  py -3.11 -m venv backend\\venv"
      : "  python3.11 -m venv backend/venv");
    process.exit(1);
  }
  const next = nextBin();
  if (!next) {
    console.error("Next.js is not installed. Run npm install in the repo root.");
    process.exit(1);
  }

  preflight(py);
  killPort(FRONT_PORT);
  killPort(BACK_PORT);

  const backend = spawnLogged(
    "backend",
    py,
    ["-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", String(BACK_PORT)],
    BACKEND,
    { PYTHONPATH: BACKEND, PYTHONUNBUFFERED: "1" }
  );

  const frontend = spawnLogged(
    "frontend",
    process.execPath,
    [next, "dev", "-p", String(FRONT_PORT)],
    ROOT
  );

  writePids({
    frontend: frontend.pid,
    backend: backend.pid,
    frontPort: FRONT_PORT,
    backPort: BACK_PORT,
    python: py,
    startedAt: new Date().toISOString(),
  });

  console.log(`Starting backend  :${BACK_PORT}  (pid ${backend.pid})`);
  console.log(`Starting frontend :${FRONT_PORT}  (pid ${frontend.pid})`);
  console.log(`Logs: ${path.join(LOG_DIR, "backend.log")}`);

  Promise.all([
    waitFor(BACK_PORT, "Backend"),
    waitFor(FRONT_PORT, "Frontend"),
  ]).then(([backOk, frontOk]) => {
    if (backOk) console.log(`Backend ready   http://127.0.0.1:${BACK_PORT}/health`);
    else {
      console.error("---- backend.log ----");
      console.error(tailLog("backend", 50));
    }
    if (frontOk) console.log(`Frontend ready  http://localhost:${FRONT_PORT}`);
    else {
      console.error("---- frontend.log ----");
      console.error(tailLog("frontend", 30));
    }
    if (!backOk || !frontOk) process.exitCode = 1;
  });
}

function stop() {
  const saved = readPids();
  if (saved.frontend) killPid(saved.frontend);
  if (saved.backend) killPid(saved.backend);
  killPort(saved.frontPort || FRONT_PORT);
  killPort(saved.backPort || BACK_PORT);
  if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  console.log(`Stopped frontend :${saved.frontPort || FRONT_PORT} and backend :${saved.backPort || BACK_PORT}`);
}

async function status() {
  const saved = readPids();
  const front = await portOpen(FRONT_PORT);
  const back = await portOpen(BACK_PORT);
  console.log(`Frontend :${FRONT_PORT}  ${front ? "UP" : "down"}${saved.frontend ? `  pid ${saved.frontend}` : ""}`);
  console.log(`Backend  :${BACK_PORT}  ${back ? "UP" : "down"}${saved.backend ? `  pid ${saved.backend}` : ""}`);
  if (back) {
    await new Promise((resolve) => {
      http.get({ host: "127.0.0.1", port: BACK_PORT, path: "/health", timeout: 1500 }, (res) => {
        let buf = "";
        res.on("data", (c) => { buf += c; });
        res.on("end", () => {
          console.log(`Health          ${buf.trim() || res.statusCode}`);
          resolve();
        });
      }).on("error", () => {
        console.log("Health          unreachable");
        resolve();
      });
    });
  } else {
    console.log("---- last backend.log ----");
    console.log(tailLog("backend", 40));
  }
  process.exit(front && back ? 0 : 1);
}

function logs() {
  console.log("==== backend ====");
  console.log(tailLog("backend", 80));
  console.log("==== frontend ====");
  console.log(tailLog("frontend", 40));
}

function restart() {
  stop();
  setTimeout(start, isWin ? 1000 : 400);
}

const cmd = (process.argv[2] || "status").toLowerCase();
const actions = { start, stop, restart, status, logs, up: start, down: stop };
if (!actions[cmd]) {
  console.error("Usage: node scripts/dev-ctl.cjs start|stop|restart|status|logs");
  process.exit(2);
}
actions[cmd]();
