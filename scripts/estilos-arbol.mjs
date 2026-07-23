// Genera dist/estilos-arbol.html: 3 direcciones de arte para el Árbol del
// Héroe (pixel art / línea dorada / orgánico silueta), cada una en 4 momentos
// (día 1, 60, 240, 450), para ELEGIR estilo antes de reimplementar el avatar.
// Uso: node scripts/estilos-arbol.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')

const ORO = '#d9a441'
const ORO_CLARO = '#f0c86e'

const marco = (contenido, extra = '') => `<svg viewBox="0 0 120 120" width="150" height="150" role="img">
  ${extra}
  <circle cx="60" cy="60" r="56" fill="#141826" stroke="#2a3045" stroke-width="2"/>
  <clipPath id="c${Math.random().toString(36).slice(2, 7)}"><circle cx="60" cy="60" r="56"/></clipPath>
  ${contenido}
</svg>`

// ---------------------------------------------------------------- A · PIXEL
const PALETA = {
  T: '#7c5f3e', t: '#5f4830',
  d: '#39622f', G: '#4e8140', g: '#6fb35a', b: '#95d47c',
  O: '#d9a441', o: '#f0c86e', W: '#fff4d6',
  S: '#b8905a', E: '#241d12', e: '#3a2d1c',
}

function pix(filas) {
  let r = '<g shape-rendering="crispEdges">'
  filas.forEach((fila, y) => {
    for (let x = 0; x < Math.min(24, fila.length); x++) {
      const c = PALETA[fila[x]]
      if (c) r += `<rect x="${12 + x * 4}" y="${12 + y * 4}" width="4" height="4" fill="${c}"/>`
    }
  })
  return r + '</g>'
}

const V = '.'.repeat(24)

const PIXEL_D1 = [
  V, V, V, V, V, V,
  '...........o............',
  '..........oWo...........',
  '...........o............',
  V, V, V, V,
  V,
  '...........So...........',
  '...........SS...........',
  '........eeeeeeee........',
  'EEEEEEEEEEEEEEEEEEEEEEEE',
  'E..e...E....e...E...e..E',
  V, V, V, V, V,
]

const PIXEL_D60 = [
  V, V, V,
  '........ddddd...........',
  '......dbgGGGGd..........',
  '.....dbggGGGGGd.........',
  '.....dgGGGGGGGd.........',
  '......dGGGGGGd..........',
  '.......ddGGdd...........',
  '..........Tt............',
  '..........Tt............',
  '..........Tt............',
  '..........Tt............',
  '..........Tt............',
  '..........Tt............',
  '.........TTtt...g.......',
  '......eeeeeeeeee........',
  'EEEEEEEEEEEEEEEEEEEEEEEE',
  'E...e....E....e....E...e',
  V, V, V, V, V,
]

const PIXEL_D240 = [
  '........ddddddd.........',
  '.....ddbggGGGGGdd.......',
  '....dbbggGGGGGGGGd......',
  '...dbggGGGGoGGGGGGd.....',
  '...dgGGOGGGGGGGoGGd.....',
  '....dGGGGGGOGGGGGd......',
  '.....dGGGGGGGGGOd.......',
  '......ddGGGGGGdd........',
  '........dGGGd...........',
  '..........TTt...........',
  '..........TTt...........',
  '..........TTt...........',
  '..........TTt...........',
  '..........TTt...........',
  '.........TTTtt..........',
  '........TTttTtt.g.......',
  '..g...eeeeeeeeee...g....',
  'EEEEEEEEEEEEEEEEEEEEEEEE',
  'E...e....E....e....E...e',
  V, V, V, V, V,
]

const PIXEL_D450 = [
  '..W.....ooOOOoo.....W...',
  '.....dooOOoOOOOod.......',
  '....doOOogGOOoOOOd......',
  '...dOogGGOGGGOgOOOd.....',
  '...dgOGOGGGGGGGOGGd..W..',
  '....dGGOGGGOGGOGGd......',
  '.....dGGGGOGGGGOd.......',
  '......ddGGGGGGdd........',
  '........dGGGd...........',
  '..........TTt...........',
  '..........TTt...........',
  '..........TTt...........',
  '..........TTt...........',
  '..........TTt...........',
  '.........TTTtt..........',
  '........TTttTtt.o.......',
  '..o...eeeeeeeeee...o....',
  'EEEEEEEEEEEEEEEEEEEEEEEE',
  'E..o.....E...o.....E..o.',
  V, V, V, V, V,
]

const estiloPixel = [
  marco(pix(PIXEL_D1)),
  marco(pix(PIXEL_D60)),
  marco(pix(PIXEL_D240)),
  marco(`${pix(PIXEL_D450)}<circle cx="60" cy="52" r="46" fill="none" stroke="${ORO}" stroke-width="1" opacity="0.45"/>`),
]

// --------------------------------------------------------- B · LÍNEA DORADA
const linea = (d, ancho = 1.6, color = ORO, op = 1) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round" opacity="${op}"/>`
const estrella = (x, y, r, op = 1) =>
  `<path d="M ${x} ${y - r} L ${x + r * 0.3} ${y - r * 0.3} L ${x + r} ${y} L ${x + r * 0.3} ${y + r * 0.3} L ${x} ${y + r} L ${x - r * 0.3} ${y + r * 0.3} L ${x - r} ${y} L ${x - r * 0.3} ${y - r * 0.3} Z" fill="${ORO_CLARO}" opacity="${op}"/>`
const sueloLinea = linea('M 26 84 Q 60 78 94 84', 1.4, ORO, 0.5)

// Hojas de trazo: abanico corto en la punta de una rama.
const ticks = (x, y, ang) => {
  let s = ''
  for (const da of [-28, 0, 28]) {
    const a = ((ang + da) * Math.PI) / 180
    s += linea(`M ${x} ${y} l ${Math.cos(a) * 5} ${-Math.sin(a) * 5}`, 1.3, ORO_CLARO, 0.9)
  }
  return s
}

const LINEA_D1 = [
  sueloLinea,
  `<ellipse cx="60" cy="72" rx="5.5" ry="7.5" fill="none" stroke="${ORO}" stroke-width="1.6"/>`,
  linea('M 60 66 Q 62.5 69 62 74', 1.2, ORO_CLARO, 0.9),
  estrella(60, 50, 3.4, 0.95),
  `<circle cx="60" cy="62" r="17" fill="none" stroke="${ORO}" stroke-width="0.8" stroke-dasharray="1.5 4" opacity="0.45"/>`,
].join('')

const LINEA_D60 = [
  sueloLinea,
  linea('M 60 82 C 58.5 72 61.5 64 60 54', 1.9),
  linea('M 60 68 C 54 64 50 60 47 53', 1.5),
  linea('M 60 62 C 66 58 69 54 72 49', 1.5),
  ticks(47, 53, 115), ticks(72, 49, 65), ticks(60, 54, 90),
  linea('M 42 82 q 1.5 -4 3.5 -5.5', 1.1, ORO, 0.5),
  linea('M 78 82 q -1.5 -4 -3.5 -5.5', 1.1, ORO, 0.5),
].join('')

const LINEA_D240 = [
  sueloLinea,
  linea('M 60 82 C 58 70 62 60 60 44', 2.2),
  linea('M 60 66 C 51 62 45 57 40 48', 1.6),
  linea('M 60 58 C 69 54 75 49 80 42', 1.6),
  linea('M 60 52 C 54 47 50 42 48 34', 1.5),
  linea('M 60 48 C 66 43 70 38 71 30', 1.5),
  linea('M 40 48 C 38 44 38 41 39 37', 1.2),
  linea('M 80 42 C 82 38 82 35 81 31', 1.2),
  ticks(39, 37, 110), ticks(48, 34, 95), ticks(60, 44, 90), ticks(71, 30, 80), ticks(81, 31, 65),
  `<circle cx="47" cy="56" r="2" fill="${ORO}"/>`,
  `<circle cx="72" cy="50" r="2" fill="${ORO}"/>`,
  `<circle cx="61" cy="38" r="2" fill="${ORO}"/>`,
  linea('M 52 84 q -2 4 -5 5', 1.1, ORO, 0.45),
  linea('M 68 84 q 2 4 5 5', 1.1, ORO, 0.45),
  linea('M 60 84 q 0.5 4.5 0 6', 1.1, ORO, 0.45),
].join('')

const LINEA_D450 = [
  `<circle cx="60" cy="58" r="47" fill="none" stroke="${ORO}" stroke-width="1" opacity="0.4"/>`,
  `<circle cx="60" cy="58" r="42" fill="none" stroke="${ORO_CLARO}" stroke-width="0.6" opacity="0.3"/>`,
  LINEA_D240,
  estrella(44, 26, 2.6, 0.95),
  estrella(74, 22, 3, 0.95),
  estrella(59, 18, 2.2, 0.8),
  linea('M 60 12 l 0 -4', 1, ORO_CLARO, 0.6),
].join('')

const estiloLinea = [marco(LINEA_D1), marco(LINEA_D60), marco(LINEA_D240), marco(LINEA_D450)]

// ----------------------------------------------------- C · ORGÁNICO SILUETA
const V_OSC = '#31572b'
const V_MED = '#457a39'
const V_CLA = '#5f9c4b'
const V_BRI = '#7fbd66'

const fondoC = `<radialGradient id="cieloC" cx="50%" cy="30%" r="80%">
    <stop offset="0%" stop-color="#1b2233"/><stop offset="100%" stop-color="#10141f"/>
  </radialGradient>`
const baseC = (resto) => `
  <g clip-path="url(#recC)">
    <circle cx="60" cy="60" r="56" fill="url(#cieloC)"/>
    <ellipse cx="60" cy="86" rx="42" ry="9" fill="#1c1712"/>
    <path d="M 18 84 Q 60 76 102 84" fill="none" stroke="#39301f" stroke-width="1.6"/>
    ${resto}
  </g>`
const defsC = `<defs>${fondoC}<clipPath id="recC"><circle cx="60" cy="60" r="56"/></clipPath>
  <linearGradient id="oroC" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%" stop-color="${V_MED}"/><stop offset="55%" stop-color="${V_CLA}"/>
    <stop offset="100%" stop-color="${ORO}"/>
  </linearGradient></defs>`

const ORG_D1 = baseC(`
  <path d="M 54 80 Q 60 75.5 66 80 Q 60 83.5 54 80 Z" fill="#242015"/>
  <path d="M 56.5 80 C 56 74.5 58.5 71 60 71 C 61.5 71 64 74.5 63.5 80 C 63 82.5 57 82.5 56.5 80 Z" fill="#b8905a"/>
  <path d="M 58.2 73.5 Q 60 75.5 60.3 78.5" fill="none" stroke="${ORO_CLARO}" stroke-width="1.1" opacity="0.9"/>
  <circle cx="60" cy="60" r="13" fill="${ORO}" opacity="0.08"/>
  <path d="M 60 55 l 1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1 Z" fill="${ORO_CLARO}"/>`)

const ORG_D60 = baseC(`
  <path d="M 59 81 C 58.4 72 59.4 66 60 60 C 60.6 66 61.6 72 61 81 Z" fill="#6d5334"/>
  <path d="M 48 56 C 45 48 52 40 60 41 C 68 40 75 48 72 56 C 74 62 68 66 60 65 C 52 66 46 62 48 56 Z" fill="${V_MED}"/>
  <path d="M 50 53 C 48 46 54 40.5 61 41.5 C 66 41 71 45 70 50 C 66 46 56 46 50 53 Z" fill="${V_CLA}"/>
  <path d="M 52 47 C 53 43.5 57 42 60 42.5 C 57 44 54 45.5 52 47 Z" fill="${V_BRI}"/>
  <path d="M 50 61 C 54 64.5 66 64.5 70 60 C 68 64 64 65.8 60 65.5 C 56 65.8 52 64 50 61 Z" fill="${V_OSC}"/>`)

const ORG_D240 = baseC(`
  <path d="M 57.5 81 C 56.5 70 58 62 59 52 L 61 52 C 62 62 63.5 70 62.5 81
           C 64.5 82.5 66 83.5 67 85 L 53 85 C 54 83.5 55.5 82.5 57.5 81 Z" fill="#6d5334"/>
  <path d="M 59.5 62 C 52 58 48 54 46 49" fill="none" stroke="#6d5334" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M 60.5 58 C 68 54 72 50 74 44" fill="none" stroke="#6d5334" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M 32 48 C 28 38 38 28 48 31 C 50 21 70 19 74 29 C 84 24 94 34 90 44
           C 97 50 91 60 81 59 C 78 66 62 69 55 64 C 44 68 30 60 32 48 Z" fill="${V_MED}"/>
  <path d="M 36 45 C 33 37 41 30 49 32.5 C 51 25 66 23 70 30 C 76 27 83 33 81 40
           C 74 32 52 31 36 45 Z" fill="${V_CLA}"/>
  <path d="M 41 36 C 44 30.5 52 28 57 29.5 C 51 31.5 45 33.5 41 36 Z" fill="${V_BRI}"/>
  <path d="M 34 53 C 42 60 74 62 88 50 C 85 58 76 62.5 66 63.5 C 52 65.5 39 61 34 53 Z" fill="${V_OSC}"/>
  <circle cx="46" cy="52" r="2.4" fill="${ORO}"/><circle cx="45.3" cy="51.3" r="0.8" fill="${ORO_CLARO}"/>
  <circle cx="70" cy="48" r="2.4" fill="${ORO}"/><circle cx="69.3" cy="47.3" r="0.8" fill="${ORO_CLARO}"/>
  <circle cx="58" cy="34" r="2.4" fill="${ORO}"/><circle cx="57.3" cy="33.3" r="0.8" fill="${ORO_CLARO}"/>
  <circle cx="80" cy="55" r="1.2" fill="${ORO_CLARO}"/><circle cx="38" cy="42" r="1.2" fill="${ORO_CLARO}"/>`)

const ORG_D450 = baseC(`
  <path d="M 57.5 81 C 56.5 70 58 62 59 52 L 61 52 C 62 62 63.5 70 62.5 81
           C 64.5 82.5 66 83.5 67 85 L 53 85 C 54 83.5 55.5 82.5 57.5 81 Z" fill="#6d5334"/>
  <path d="M 59.5 62 C 52 58 48 54 46 49" fill="none" stroke="#6d5334" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M 60.5 58 C 68 54 72 50 74 44" fill="none" stroke="#6d5334" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M 32 48 C 28 38 38 28 48 31 C 50 21 70 19 74 29 C 84 24 94 34 90 44
           C 97 50 91 60 81 59 C 78 66 62 69 55 64 C 44 68 30 60 32 48 Z" fill="url(#oroC)"/>
  <path d="M 36 45 C 33 37 41 30 49 32.5 C 51 25 66 23 70 30 C 76 27 83 33 81 40
           C 74 32 52 31 36 45 Z" fill="${ORO_CLARO}" opacity="0.5"/>
  <path d="M 34 53 C 42 60 74 62 88 50 C 85 58 76 62.5 66 63.5 C 52 65.5 39 61 34 53 Z" fill="${V_OSC}" opacity="0.8"/>
  <circle cx="46" cy="52" r="2.4" fill="${ORO}"/><circle cx="70" cy="48" r="2.4" fill="${ORO}"/>
  <circle cx="58" cy="34" r="2.4" fill="${ORO}"/>
  <circle cx="34" cy="40" r="1.1" fill="${ORO_CLARO}" opacity="0.9"/>
  <circle cx="86" cy="36" r="1.1" fill="${ORO_CLARO}" opacity="0.7"/>
  <circle cx="42" cy="66" r="1.1" fill="${ORO_CLARO}" opacity="0.8"/>
  <path d="M 44 22 l 0.9 2.3 2.3 0.9 -2.3 0.9 -0.9 2.3 -0.9 -2.3 -2.3 -0.9 2.3 -0.9 Z" fill="${ORO_CLARO}"/>
  <path d="M 76 17 l 1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1 Z" fill="${ORO_CLARO}"/>
  <circle cx="60" cy="56" r="49" fill="none" stroke="${ORO}" stroke-width="1" opacity="0.4"/>`)

const estiloOrganico = [
  `<svg viewBox="0 0 120 120" width="150" height="150">${defsC}<circle cx="60" cy="60" r="56" fill="#141826" stroke="#2a3045" stroke-width="2"/>${ORG_D1}</svg>`,
  `<svg viewBox="0 0 120 120" width="150" height="150">${defsC}<circle cx="60" cy="60" r="56" fill="#141826" stroke="#2a3045" stroke-width="2"/>${ORG_D60}</svg>`,
  `<svg viewBox="0 0 120 120" width="150" height="150">${defsC}<circle cx="60" cy="60" r="56" fill="#141826" stroke="#2a3045" stroke-width="2"/>${ORG_D240}</svg>`,
  `<svg viewBox="0 0 120 120" width="150" height="150">${defsC}<circle cx="60" cy="60" r="56" fill="#141826" stroke="#2a3045" stroke-width="2"/>${ORG_D450}</svg>`,
]

// ------------------------------------------------------------------ página
const DIAS = ['día 1', 'día 60', 'día 240', 'día 450']

function seccion(titulo, pitch, svgs) {
  const figs = svgs
    .map((s, i) => `<figure>${s}<figcaption>${DIAS[i]}</figcaption></figure>`)
    .join('\n')
  return `<section><h2>${titulo}</h2><p>${pitch}</p><div class="fila">${figs}</div></section>`
}

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>El Árbol del Héroe — elige el estilo</title>
<style>
  body { margin: 0; background: #0c0e13; color: #e8e6df; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; }
  header { text-align: center; padding: 26px 16px 4px; }
  h1 { margin: 0; font-size: 22px; color: #d9a441; }
  header p { color: #98a0b8; font-size: 14px; max-width: 520px; margin: 8px auto 0; }
  section { max-width: 760px; margin: 22px auto; padding: 0 16px; }
  h2 { font-size: 17px; color: #f0c86e; margin: 0 0 2px; }
  section > p { color: #98a0b8; font-size: 13.5px; margin: 2px 0 10px; }
  .fila { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
  figure { margin: 0; background: #151824; border: 1px solid #2a3045; border-radius: 14px; padding: 10px; text-align: center; }
  figure svg { width: 100%; height: auto; display: block; }
  figcaption { margin-top: 6px; font-size: 12.5px; color: #d9a441; }
  footer { text-align: center; color: #98a0b8; font-size: 13px; padding: 10px 16px 30px; max-width: 520px; margin: 0 auto; }
</style>
</head>
<body>
<header>
  <h1>🌱 El Árbol del Héroe — elige el estilo</h1>
  <p>Tres direcciones de arte, cada una en cuatro momentos del camino. La mecánica
  no cambia con ninguna: 43 momentos señalables, crecimiento lento por días de
  acción, nunca retrocede. Elige la que quieras ver crecer.</p>
</header>
${seccion('A · Pixel art', 'Retro RPG, píxel gordo y honesto. Encaja con la épica de la app y envejece bien.', estiloPixel)}
${seccion('B · Línea dorada', 'Un emblema grabado en oro sobre la piedra, tipo alquimia. Elegante, crece en trazos.', estiloLinea)}
${seccion('C · Orgánico silueta', 'Ilustración plana con siluetas suaves y luz de atardecer. La más "de cuento".', estiloOrganico)}
<footer>Cuarta opción: usar un pack de sprites de un artista (como los retratos de
LifeCraft) — buscamos packs de árboles con licencia clara y eliges uno.</footer>
</body>
</html>
`

mkdirSync(join(RAIZ, 'dist'), { recursive: true })
writeFileSync(join(RAIZ, 'dist', 'estilos-arbol.html'), html, 'utf8')
console.log('página de estilos generada en dist/estilos-arbol.html')
