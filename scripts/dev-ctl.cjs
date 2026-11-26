#!/usr/bin/env node
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

function say(msg) {
  try {
    process.stdout.write(String(msg) + "\n");
  } catch { /* ignore */ }
}

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
  const names = isWin ? ["python.exe", "python3.exe"] : ["python", "python3"];
  const folder = isWin ? "Scripts" : "bin";
  for (const v of ["venv", "venv311"]) {
    for (const name of names) {
      const p = path.join(BACKEND, v, folder, name);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function nextBin() {
  const p = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  return fs.existsSync(p) ? p : null;
}

function tailFile(file, lines) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").trim().split("\n").slice(-lines).join("\n");
}

function tailLog(name, lines = 40) {
  const files = [
    path.join(LOG_DIR, `${name}.err.log`),
    path.join(LOG_DIR, `${name}.out.log`),
    path.join(LOG_DIR, `${name}.log`),
  ];
  const chunks = files.map((f) => tailFile(f, lines)).filter(Boolean);
  return chunks.join("\n") || `(no ${name} logs yet)` ;
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
  } catch { /* gone */ }
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
    sock.setTimeout(500, () => {
      sock.destroy();
      resolve(false);
    });
  });
}

function waitFor(port, label, ms = 45000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const tick = async () => {
      if (await portOpen(port)) return resolve(true);
      if (Date.now() - start > ms) {
        say(`${label} did not open on :${port} within ${ms}ms`);
        return resolve(false);
      }
      setTimeout(tick, 500);
    };
    tick();
  });
}

function spawnUnix(command, args, cwd, extraEnv, logName) {
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${logName}.log`);
  fs.appendFileSync(logPath, `\n----- ${new Date().toISOString()} -----\n`);
  const out = fs.openSync(logPath, "a");
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...(extraEnv || {}) },
    detached: true,
    stdio: ["ignore", out, out],
    shell: false,
  });
  child.unref();
  return child.pid;
}

function startProcessWin(filePath, args, cwd, extraEnv, redirect) {
  const envLines = Object.entries(extraEnv || {})
    .map(([k, v]) => `$env:${k} = ${JSON.stringify(String(v))}`)
    .join("; ");
  const argList = (args || []).map((a) => JSON.stringify(String(a))).join(", ");
  let extra = "";
  if (redirect) {
    extra = `-RedirectStandardOutput ${JSON.stringify(redirect.out)} -RedirectStandardError ${JSON.stringify(redirect.err)}`;
  }
  const script = `
    ${envLines}
    $p = Start-Process -FilePath ${JSON.stringify(filePath)} `
    + (args && args.length ? `-ArgumentList @(${argList}) ` : "")
    + `-WorkingDirectory ${JSON.stringify(cwd)} `
    + `-WindowStyle Hidden `
    + extra + ` -PassThru
    Write-Output $p.Id
  `;
  const r = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
    { encoding: "utf8", windowsHide: true }
  );
  const pid = Number(String(r.stdout || "").trim().split(/\s+/).pop());
  if (!Number.isFinite(pid) || pid <= 0) {
    say(`Failed to launch ${filePath}`);
    say((r.stderr || r.stdout || "").trim());
    return 0;
  }
  return pid;
}

function preflight(py) {
  const check = spawnSync(
    py,
    ["-c", "import sys,uvicorn,fastapi; print(sys.version.split()[0]); print(uvicorn.__version__)"],
    { cwd: BACKEND, encoding: "utf8" }
  );
  if (check.status !== 0) {
    say("Backend venv cannot import uvicorn/fastapi.");
    say((check.stderr || check.stdout || "").trim());
    process.exit(1);
  }
  const [pyVer, uvVer] = (check.stdout || "").trim().split(/\r?\n/);
  say(`Python ${pyVer}  uvicorn ${uvVer}`);
}

function start() {
  const py = pythonBin();
  if (!py) {
    say("No backend venv Python found under backend\\venv.");
    process.exit(1);
  }
  preflight(py);

  say("Stopping anything already on 3000 / 8000...");
  killPort(FRONT_PORT);
  killPort(BACK_PORT);

  let backendPid;
  let frontendPid;

  if (isWin) {
    ensureLogDir();
    const bout = path.join(LOG_DIR, "backend.out.log");
    const berr = path.join(LOG_DIR, "backend.err.log");
    backendPid = startProcessWin(
      py,
      ["-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", String(BACK_PORT)],
      BACKEND,
      { PYTHONPATH: BACKEND, PYTHONUNBUFFERED: "1" },
      { out: bout, err: berr }
    );
    // Next.js hangs if stdout is redirected to a file on Windows.
    frontendPid = startProcessWin(
      path.join(__dirname, "start-frontend.cmd"),
      [],
      ROOT,
      {},
      null
    );
  } else {
    const next = nextBin();
    if (!next) {
      say("Next.js is missing. Run npm install.");
      process.exit(1);
    }
    backendPid = spawnUnix(
      py,
      ["-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", String(BACK_PORT)],
      BACKEND,
      { PYTHONPATH: BACKEND, PYTHONUNBUFFERED: "1" },
      "backend"
    );
    frontendPid = spawnUnix(process.execPath, [next, "dev", "-p", String(FRONT_PORT)], ROOT, {}, "frontend");
  }

  writePids({
    frontend: frontendPid,
    backend: backendPid,
    frontPort: FRONT_PORT,
    backPort: BACK_PORT,
    startedAt: new Date().toISOString(),
  });
  say(`Launched backend pid ${backendPid}  frontend pid ${frontendPid}`);
  say("Waiting for ports...");

  return Promise.all([
    waitFor(BACK_PORT, "Backend"),
    waitFor(FRONT_PORT, "Frontend"),
  ]).then(([backOk, frontOk]) => {
    if (backOk) say(`Backend ready   http://127.0.0.1:${BACK_PORT}/health`);
    else say(tailLog("backend", 40));
    if (frontOk) say(`Frontend ready  http://localhost:${FRONT_PORT}`);
    else {
      say("Frontend did not bind :3000.");
      say("Start it in this window with:  npm run dev:frontend");
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
  say(`Stopped frontend :${saved.frontPort || FRONT_PORT} and backend :${saved.backPort || BACK_PORT}`);
}

async function status() {
  const saved = readPids();
  const front = await portOpen(FRONT_PORT);
  const back = await portOpen(BACK_PORT);
  say(`Frontend :${FRONT_PORT}  ${front ? "UP" : "down"}${saved.frontend ? `  pid ${saved.frontend}` : ""}`);
  say(`Backend  :${BACK_PORT}  ${back ? "UP" : "down"}${saved.backend ? `  pid ${saved.backend}` : ""}`);
  if (back) {
    await new Promise((resolve) => {
      http.get({ host: "127.0.0.1", port: BACK_PORT, path: "/health", timeout: 1500 }, (res) => {
        let buf = "";
        res.on("data", (c) => { buf += c; });
        res.on("end", () => {
          say(`Health          ${buf.trim() || res.statusCode}`);
          resolve();
        });
      }).on("error", () => {
        say("Health          unreachable");
        resolve();
      });
    });
  }
  process.exit(front && back ? 0 : 1);
}

function logs() {
  say("==== backend ====");
  say(tailLog("backend", 80));
}

function restart() {
  stop();
  setTimeout(() => {
    const p = start();
    if (p && p.then) p.catch((err) => { say(err); process.exit(1); });
  }, isWin ? 1200 : 400);
}

const cmd = (process.argv[2] || "status").toLowerCase();
const actions = { start, stop, restart, status, logs, up: start, down: stop };
if (!actions[cmd]) {
  say("Usage: node scripts/dev-ctl.cjs start|stop|restart|status|logs");
  process.exit(2);
}
const result = actions[cmd]();
if (result && typeof result.then === "function") {
  result.catch((err) => {
    say(err && err.stack ? err.stack : err);
    process.exit(1);
  });
}
