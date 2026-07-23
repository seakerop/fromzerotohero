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
import Avatar from './src/components/Avatar.jsx'
import { ETAPAS_ARBOL, etapaArbol } from './src/data/arbol.js'
const DIAS = [0, 2, 3, 5, 7, 10, 14, 17, 21, 25, 30, 36, 42, 50, 60, 70, 85,
  100, 115, 132, 150, 170, 190, 205, 225, 240, 265, 300, 340, 365, 400, 450]
export const tarjetas = DIAS.map((d) => ({
  d,
  etapa: etapaArbol(d).nombre,
  hito: ETAPAS_ARBOL.some((x) => x.dias === d),
  svg: renderToStaticMarkup(createElement(Avatar, { dias: d, tam: 130 })),
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
const { tarjetas } = await import(pathToFileURL(bundle).href)
rmSync(bundle, { force: true })

const figuras = tarjetas
  .map(
    (t) => `      <figure${t.hito ? ' class="hito"' : ''}>
        ${t.svg}
        <figcaption>
          <strong>día ${t.d}</strong>
          <span>${t.etapa}${t.hito ? ' ★' : ''}</span>
        </figcaption>
      </figure>`
  )
  .join('\n')

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>El Árbol del Héroe — las 15 etapas</title>
<style>
  body { margin: 0; background: #0c0e13; color: #e8e6df; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; }
  header { text-align: center; padding: 26px 16px 6px; }
  h1 { margin: 0; font-size: 22px; color: #d9a441; }
  header p { color: #98a0b8; font-size: 14px; max-width: 460px; margin: 8px auto 0; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; padding: 18px; max-width: 1200px; margin: 0 auto; }
  figure { margin: 0; background: #151824; border: 1px solid #2a3045; border-radius: 14px; padding: 12px 8px; text-align: center; }
  figure.hito { border-color: #d9a441; }
  figure svg { margin: 0 auto; display: block; }
  figcaption { margin-top: 6px; display: flex; flex-direction: column; gap: 1px; }
  figcaption strong { font-size: 14px; }
  figcaption span { color: #d9a441; font-size: 12px; }
</style>
</head>
<body>
<header>
  <h1>🌱 El Árbol del Héroe</h1>
  <p>32 momentos de los primeros 450 días de acción. El árbol es continuo: altura,
  ramas, hojas, flores y frutos crecen poco a poco, casi cada día. Las tarjetas
  doradas ★ son los hitos con nombre.</p>
</header>
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
