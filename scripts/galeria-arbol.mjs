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
const MESES = [['primavera 🌸', 4], ['verano ☀️', 7], ['otoño 🍂', 10], ['invierno ❄️', 1]]
export const secciones = MESES.map(([nombre, mes]) => ({
  nombre,
  tarjetas: MOMENTOS_ARBOL.map((m) => ({
    d: m.dia,
    etiqueta: m.etiqueta,
    hito: ETAPAS_ARBOL.some((x) => x.dias === m.dia),
    svg: renderToStaticMarkup(createElement(Avatar, { dias: m.dia, tam: 120, mes })),
  })),
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
const { secciones } = await import(pathToFileURL(bundle).href)
rmSync(bundle, { force: true })

const cuerpo = secciones
  .map((s) => {
    const figuras = s.tarjetas
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
    return `<h2 class="tit">${s.nombre}</h2>\n<main>\n${figuras}\n</main>`
  })
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
  <h1>🌱 El Árbol del Héroe — todas las imágenes</h1>
  <p>La matriz completa: los 49 momentos del camino en cada una de las 4
  estaciones (196 combinaciones). El crecimiento lo marcan tus días de acción;
  la estación del calendario real viste cualquier estado del árbol.</p>
</header>
${cuerpo}
</body>
</html>
`

mkdirSync(join(RAIZ, 'dist'), { recursive: true })
const salida = join(RAIZ, 'dist', 'galeria-arbol.html')
writeFileSync(salida, html, 'utf8')
const total = secciones.reduce((n, s) => n + s.tarjetas.length, 0)
console.log('galería generada en ' + salida + ' (' + total + ' imágenes en ' + secciones.length + ' estaciones)')
