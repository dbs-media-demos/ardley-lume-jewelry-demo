// Runs one command against the production server, then stops the server (the command always finishes).
//   npm run build && node scripts/with-server.mjs node scripts/hero-still.mjs
// (This demo has no CRM preview route.)
import { spawn, spawnSync } from "node:child_process";

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("usage: node scripts/with-server.mjs <command> [args…]");
  process.exit(1);
}
const shell = process.platform === "win32";
const port = process.env.PORT ?? "4250";
const env = { ...process.env };
delete env.NODE_USE_SYSTEM_CA;
const server = spawn("npx", ["next", "start", "-p", port], { stdio: "ignore", shell, env });
const stop = () => {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill("SIGTERM");
};
const guard = setTimeout(() => {
  console.error("with-server: timed out after 15 min");
  stop();
  process.exit(1);
}, 15 * 60 * 1000);

let up = false;
for (let i = 0; i < 120 && !up; i++) {
  try {
    up = (await fetch(`http://localhost:${port}/`)).ok;
  } catch {}
  if (!up) await new Promise((r) => setTimeout(r, 500));
}
if (!up) {
  console.error("with-server: the server did not start");
  stop();
  process.exit(1);
}
const run = spawnSync(cmd, args, { stdio: "inherit", shell, env: { ...env, URL: `http://localhost:${port}` } });
clearTimeout(guard);
stop();
process.exit(run.status ?? 1);
