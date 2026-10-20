// Resume "en qué quedó el repo": rama, cambios sin commitear, últimos commits,
// commits nuevos en origin y la última entrada de BITACORA.md.
// - Claude Code lo ejecuta solo al iniciar sesión (hook SessionStart en .claude/settings.json).
// - Codex y los humanos lo ejecutan con: npm run contexto
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { cwd: RAIZ, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
};

const rama = git("rev-parse --abbrev-ref HEAD") || "(sin commits aún)";
const cambios = git("status --short");
const commits = git("log --oneline -8");
const remoto = git(`rev-parse --abbrev-ref --symbolic-full-name @{u}`);
const atrasado = remoto ? git(`rev-list --count HEAD..${remoto}`) : "";

let ultimaEntrada = "(no hay BITACORA.md)";
const rutaBitacora = join(RAIZ, "BITACORA.md");
if (existsSync(rutaBitacora)) {
  const partes = readFileSync(rutaBitacora, "utf8").split(/\n(?=## )/);
  ultimaEntrada = partes.at(-1)?.trim() ?? "(vacía)";
}

console.log(`=== CONTEXTO DEL REPO ===
Rama actual: ${rama}${rama === "main" ? "  ⚠ estás en main: crea una rama antes de cambiar código" : ""}
${remoto ? `Commits en ${remoto} que aún no tienes: ${atrasado || 0}${Number(atrasado) > 0 ? "  → haz git pull" : ""}` : "Rama sin upstream (aún no se ha hecho push)"}

Cambios sin commitear:
${cambios || "(ninguno)"}

Últimos commits:
${commits || "(ninguno)"}

Última entrada de BITACORA.md:
${ultimaEntrada}
=========================`);
