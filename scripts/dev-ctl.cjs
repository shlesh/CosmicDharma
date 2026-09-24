#!/usr/bin/env node
/**
 * Start, stop, restart, and status for frontend + backend.
 * Works in Windows PowerShell, cmd, and Unix shells.
 */
const { spawn, execSync } = require("child_process");
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
  const candidates = isWin
    ? [
        path.join(BACKEND, "venv", "Scripts", "python.exe"),
        path.join(BACKEND, "venv311", "Scripts", "python.exe"),
      ]
    : [
        path.join(BACKEND, "venv", "bin", "python"),
        path.join(BACKEND, "venv311", "bin", "python"),
      ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function pidsOnPort(port) {
  try {
    if (isWin) {
      const out = execSync("netstat -ano", { encoding: "utf8" });
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        if (!/LISTENING/i.test(line)) continue;
        if (!line.includes(`:${port} `) && !line.includes(`:${port}\t`)) continue;
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
    if (isWin) {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
    } else {
      process.kill(Number(pid), "SIGTERM");
    }
  } catch {
    /* already gone */
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

function waitFor(port, label, ms = 25000) {
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
  const out = fs.openSync(logPath, "a");
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...(extraEnv || {}) },
    detached: true,
    stdio: ["ignore", out, out],
    windowsHide: true,
    shell: isWin,
  });
  child.unref();
  return { pid: child.pid, logPath };
}

function start() {
  const py = pythonBin();
  if (!py) {
    console.error("No backend venv Python found.");
    console.error("From repo root:");
    console.error(isWin
      ? "  py -3.11 -m venv backend\\venv"
      : "  python3.11 -m venv backend/venv");
    console.error("  then:  backend\\venv\\Scripts\\python -m pip install -r backend\\requirements.txt");
    process.exit(1);
  }

  killPort(FRONT_PORT);
  killPort(BACK_PORT);

  const backend = spawnLogged(
    "backend",
    py,
    ["-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", String(BACK_PORT)],
    BACKEND,
    { PYTHONPATH: BACKEND }
  );

  const frontend = spawnLogged(
    "frontend",
    isWin ? "npx.cmd" : "npx",
    ["next", "dev", "-p", String(FRONT_PORT)],
    ROOT
  );

  writePids({
    frontend: frontend.pid,
    backend: backend.pid,
    frontPort: FRONT_PORT,
    backPort: BACK_PORT,
    startedAt: new Date().toISOString(),
  });

  console.log(`Starting backend  :${BACK_PORT}  (pid ${backend.pid})`);
  console.log(`Starting frontend :${FRONT_PORT}  (pid ${frontend.pid})`);
  console.log(`Logs: ${path.join(LOG_DIR, "backend.log")} and frontend.log`);

  Promise.all([
    waitFor(BACK_PORT, "Backend"),
    waitFor(FRONT_PORT, "Frontend"),
  ]).then(([backOk, frontOk]) => {
    if (backOk) console.log(`Backend ready   http://localhost:${BACK_PORT}/health`);
    if (frontOk) console.log(`Frontend ready  http://localhost:${FRONT_PORT}`);
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
  }
  process.exit(front && back ? 0 : 1);
}

function restart() {
  stop();
  setTimeout(start, isWin ? 800 : 400);
}

const cmd = (process.argv[2] || "status").toLowerCase();
const actions = { start, stop, restart, status, up: start, down: stop };
if (!actions[cmd]) {
  console.error("Usage: node scripts/dev-ctl.cjs start|stop|restart|status");
  process.exit(2);
}
actions[cmd]();
