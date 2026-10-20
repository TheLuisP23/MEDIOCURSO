// Levanta backend (puerto 3000) y frontend (puerto 5173) a la vez.
// Uso: npm run dev   — Ctrl+C detiene ambos.
import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const procesos = [
  spawn(npm, ["run", "dev", "-w", "backend"], { stdio: "inherit", shell: process.platform === "win32" }),
  spawn(npm, ["run", "dev", "-w", "frontend"], { stdio: "inherit", shell: process.platform === "win32" }),
];

const detener = () => procesos.forEach((p) => p.kill());
process.on("SIGINT", detener);
process.on("SIGTERM", detener);
procesos.forEach((p) => p.on("exit", (code) => code && code !== 0 && detener()));
