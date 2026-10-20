// Las skills viven en .agents/skills/ (las lee Codex). Claude Code las busca en
// .claude/skills/. Este script copia unas en otras para no mantener dos versiones.
//   npm run sync:skills    → copia .agents/skills → .claude/skills
//   npm run check:skills   → falla si están desincronizadas (lo usa el CI)
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const ORIGEN = join(RAIZ, ".agents", "skills");
const DESTINO = join(RAIZ, ".claude", "skills");
const soloVerificar = process.argv.includes("--check");

function archivos(dir) {
  if (!existsSync(dir)) return [];
  const salida = [];
  const recorrer = (d) => {
    for (const n of readdirSync(d)) {
      const r = join(d, n);
      statSync(r).isDirectory() ? recorrer(r) : salida.push(relative(dir, r).replaceAll("\\", "/"));
    }
  };
  recorrer(dir);
  return salida.sort();
}

if (!soloVerificar) {
  rmSync(DESTINO, { recursive: true, force: true });
  cpSync(ORIGEN, DESTINO, { recursive: true });
  console.log("✓ skills copiadas de .agents/skills a .claude/skills");
  process.exit(0);
}

const a = archivos(ORIGEN);
const b = archivos(DESTINO);
const normalizar = (t) => t.replace(/\r\n/g, "\n");
const distintos = [...new Set([...a, ...b])].filter(
  (f) =>
    !a.includes(f) ||
    !b.includes(f) ||
    normalizar(readFileSync(join(ORIGEN, f), "utf8")) !== normalizar(readFileSync(join(DESTINO, f), "utf8")),
);

if (distintos.length) {
  console.error("✗ check:skills: .claude/skills no coincide con .agents/skills en:");
  distintos.forEach((f) => console.error(`  - ${f}`));
  console.error("  Edita SOLO .agents/skills/ y luego ejecuta: npm run sync:skills");
  process.exit(1);
}
console.log(`✓ check:skills: ${a.length} archivo(s) sincronizados`);
