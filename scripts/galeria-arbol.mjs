// Genera dist/galeria-arbol.html con las 15 etapas del Árbol del Héroe,
// renderizadas con el componente Avatar real. Uso: node scripts/galeria-arbol.mjs
import { build } from 'esbuild'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')

const entrada = `
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Avatar, { MOMENTOS_ARBOL } from './src/components/Avatar.jsx'
import { ETAPAS_ARBOL } from './src/data/arbol.js'
const MESES = [['primavera', 4], ['verano', 7], ['otoño', 10], ['invierno', 1]]
export const estaciones = []
for (const d of [120, 300]) {
  for (const [nombre, mes] of MESES) {
    estaciones.push({ d, nombre,
      svg: renderToStaticMarkup(createElement(Avatar, { dias: d, tam: 120, mes })) })
  }
}
export const tarjetas = MOMENTOS_ARBOL.map((m) => ({
  d: m.dia,
  etiqueta: m.etiqueta,
  hito: ETAPAS_ARBOL.some((x) => x.dias === m.dia),
  svg: renderToStaticMarkup(createElement(Avatar, { dias: m.dia, tam: 120, mes: 7 })),
}))
`

const bundle = join(tmpdir(), `galeria-arbol-${Date.now()}.mjs`)
await build({
  stdin: { contents: entrada, resolveDir: RAIZ, loader: 'jsx', sourcefile: 'galeria-entrada.jsx' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  jsx: 'automatic',
  outfile: bundle,
  logLevel: 'silent',
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
})
const { tarjetas, estaciones } = await import(pathToFileURL(bundle).href)
rmSync(bundle, { force: true })

const figurasEstaciones = estaciones
  .map(
    (e) => `      <figure class="estacion">
        ${e.svg}
        <figcaption>
          <strong>${e.nombre}</strong>
          <span>día ${e.d}</span>
        </figcaption>
      </figure>`
  )
  .join('\n')

const figuras = tarjetas
  .map(
    (t) => `      <figure${t.hito ? ' class="hito"' : ''}>
        ${t.svg}
        <figcaption>
          <strong>día ${t.d}</strong>
          <span>${t.etiqueta}${t.hito ? ' ★' : ''}</span>
        </figcaption>
      </figure>`
  )
  .join('\n')

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>El Árbol del Héroe — momentos y estaciones</title>
<style>
  body { margin: 0; background: #0c0e13; color: #e8e6df; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; }
  header { text-align: center; padding: 26px 16px 6px; }
  h1 { margin: 0; font-size: 22px; color: #d9a441; }
  header p { color: #98a0b8; font-size: 14px; max-width: 460px; margin: 8px auto 0; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; padding: 18px; max-width: 1200px; margin: 0 auto; }
  figure { margin: 0; background: #151824; border: 1px solid #2a3045; border-radius: 14px; padding: 12px 8px; text-align: center; }
  figure.hito { border-color: #d9a441; }
  figure.estacion { border-color: #3a4258; }
  .tit { max-width: 1200px; margin: 14px auto 0; padding: 0 18px; font-size: 15px; color: #f0c86e; }
  figure svg { margin: 0 auto; display: block; }
  figcaption { margin-top: 6px; display: flex; flex-direction: column; gap: 1px; }
  figcaption strong { font-size: 14px; }
  figcaption span { color: #d9a441; font-size: 12px; }
</style>
</head>
<body>
<header>
  <h1>🌱 El Árbol del Héroe</h1>
  <p>El árbol vive en el calendario real: la estación del año lo viste
  (flores en primavera, ámbar y hojas cayendo en otoño, nieve encima en
  invierno) mientras el crecimiento sigue su ritmo por días de acción.</p>
</header>
<h2 class="tit">Las cuatro estaciones — mismo árbol, distinto mes</h2>
<main>
${figurasEstaciones}
</main>
<h2 class="tit">49 momentos en 450 días — cada pocos días, algo nuevo que señalar</h2>
<main>
${figuras}
</main>
</body>
</html>
`

mkdirSync(join(RAIZ, 'dist'), { recursive: true })
const salida = join(RAIZ, 'dist', 'galeria-arbol.html')
writeFileSync(salida, html, 'utf8')
console.log('galería generada en ' + salida + ' (' + tarjetas.length + ' etapas)')
