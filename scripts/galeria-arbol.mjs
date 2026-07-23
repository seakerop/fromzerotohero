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
import { ETAPAS_ARBOL } from './src/data/arbol.js'
export const tarjetas = ETAPAS_ARBOL.map((e, i) => ({
  n: i + 1,
  nombre: e.nombre,
  dias: e.dias,
  descripcion: e.descripcion,
  svg: renderToStaticMarkup(createElement(Avatar, { dias: e.dias, tam: 150 })),
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
    (t) => `      <figure>
        ${t.svg}
        <figcaption>
          <strong>${t.n} · ${t.nombre}</strong>
          <span>${t.dias === 0 ? 'el comienzo' : `desde el día ${t.dias}`}</span>
          <em>«${t.descripcion}»</em>
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
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; padding: 18px; max-width: 1100px; margin: 0 auto; }
  figure { margin: 0; background: #151824; border: 1px solid #2a3045; border-radius: 14px; padding: 14px 10px; text-align: center; }
  figure svg { margin: 0 auto; display: block; }
  figcaption { margin-top: 8px; display: flex; flex-direction: column; gap: 2px; }
  figcaption strong { font-size: 15px; }
  figcaption span { color: #d9a441; font-size: 12.5px; }
  figcaption em { color: #98a0b8; font-size: 12.5px; font-style: italic; }
</style>
</head>
<body>
<header>
  <h1>🌱 El Árbol del Héroe</h1>
  <p>Crece con tus días de acción: días en los que entrenas, te mueves o registras.
  Máximo un día por día real. Nunca se marchita: crece o espera.</p>
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
