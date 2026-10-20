// Sensor del harness: verifica que las specs estén bien formadas y que lo
// "Implementado" esté realmente cubierto por tests.  Uso: npm run check:specs
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const SPECS = join(RAIZ, "specs");
const ESTADOS = ["Borrador", "Aprobada", "En curso", "Implementada"];
const SECCIONES = ["## Criterios de aceptación", "## Reglas de negocio", "## Fuera de alcance"];
const LINEA_TAREA = /^- \[( |x)\] T\d+ \[[BFD]\] .+\(dueño: [AB]\)( — EN CURSO: .+)?$/;

const errores = [];
const definicionesRN = new Map();
const definicionesCA = new Map();

function leerTestsDe(carpeta) {
  const dir = join(RAIZ, carpeta, "test");
  if (!existsSync(dir)) return "";
  let texto = "";
  const recorrer = (d) => {
    for (const nombre of readdirSync(d)) {
      const ruta = join(d, nombre);
      if (statSync(ruta).isDirectory()) recorrer(ruta);
      else if (/\.test\.tsx?$/.test(nombre)) texto += readFileSync(ruta, "utf8") + "\n";
    }
  };
  recorrer(dir);
  return texto;
}
const textoTests = leerTestsDe("backend") + leerTestsDe("frontend");

const carpetas = readdirSync(SPECS)
  .filter((n) => /^\d{3}-/.test(n) && statSync(join(SPECS, n)).isDirectory())
  .sort();

for (const carpeta of carpetas) {
  const base = join(SPECS, carpeta);
  const rutaSpec = join(base, "spec.md");
  if (!existsSync(rutaSpec)) {
    errores.push(`${carpeta}: falta spec.md`);
    continue;
  }
  const spec = readFileSync(rutaSpec, "utf8");

  const estado = spec.match(/\*\*Estado:\*\*\s*([^\n]+)/)?.[1]?.trim();
  if (!estado || !ESTADOS.includes(estado)) {
    errores.push(`${carpeta}/spec.md: "Estado" debe ser uno de: ${ESTADOS.join(", ")} (encontrado: ${estado ?? "nada"})`);
  }
  for (const seccion of SECCIONES) {
    if (!spec.includes(seccion)) errores.push(`${carpeta}/spec.md: falta la sección "${seccion}"`);
  }

  const rns = [...spec.matchAll(/^\|\s*(RN-\d+)\s*\|/gm)].map((m) => m[1]);
  const cas = [...spec.matchAll(/\*\*(CA-\d+)\*\*/g)].map((m) => m[1]);
  for (const [lista, mapa] of [[rns, definicionesRN], [cas, definicionesCA]]) {
    for (const codigo of lista) {
      if (mapa.has(codigo)) errores.push(`${codigo} está definido dos veces: en ${mapa.get(codigo)} y en ${carpeta}`);
      else mapa.set(codigo, carpeta);
    }
  }

  const rutaTasks = join(base, "tasks.md");
  const tieneTasks = existsSync(rutaTasks);
  if ((estado === "En curso" || estado === "Implementada") && !(tieneTasks && existsSync(join(base, "plan.md")))) {
    errores.push(`${carpeta}: con estado "${estado}" debe tener plan.md y tasks.md`);
  }

  let pendientes = 0;
  if (tieneTasks) {
    const lineas = readFileSync(rutaTasks, "utf8").split(/\r?\n/).filter((l) => l.startsWith("- ["));
    lineas.forEach((linea) => {
      if (!LINEA_TAREA.test(linea)) {
        errores.push(`${carpeta}/tasks.md: formato inválido → "${linea}"\n    esperado: - [ ] T<n> [B|F|D] descripción (dueño: A|B)`);
      }
      if (linea.startsWith("- [ ]")) pendientes++;
    });
  }

  if (estado === "Implementada") {
    if (pendientes > 0) errores.push(`${carpeta}: está "Implementada" pero tiene ${pendientes} tarea(s) sin marcar`);
    // Specs de infraestructura pueden declarar "**Verificación:** manual": sus CA se
    // verifican a mano (y se documentan en docs/informe), pero las RN siempre exigen test.
    const verificacionManual = /\*\*Verificación:\*\*\s*manual/i.test(spec);
    for (const codigo of verificacionManual ? rns : [...rns, ...cas]) {
      if (!new RegExp(`\\b${codigo}\\b`).test(textoTests)) {
        errores.push(`${carpeta}: ${codigo} no aparece en ningún test (backend/test o frontend/test)`);
      }
    }
  }
}

if (errores.length) {
  console.error(`✗ check:specs encontró ${errores.length} problema(s):\n`);
  errores.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`✓ check:specs: ${carpetas.length} specs OK (${definicionesRN.size} reglas, ${definicionesCA.size} criterios)`);
