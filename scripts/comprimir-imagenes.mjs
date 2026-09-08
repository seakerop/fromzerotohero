// Convierte los PNG generados en arte/ejercicios a WebP comprimido en
// public/img/ejercicios (lo que se sirve con la app).
// 1024px ~1.5MB → 640px webp ~25KB: el lote entero pesa menos que una foto.
//
// Uso: node scripts/comprimir-imagenes.mjs [--forzar]

import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const dirEntrada = join(raiz, 'arte', 'ejercicios')
const dirSalida = join(raiz, 'public', 'img', 'ejercicios')
const forzar = process.argv.includes('--forzar')

if (!existsSync(dirEntrada)) {
  console.error(`No existe ${dirEntrada}. Genera primero con scripts/gen-imagenes.mjs`)
  process.exit(1)
}
mkdirSync(dirSalida, { recursive: true })

const fuentes = readdirSync(dirEntrada).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
let hechas = 0
let saltadas = 0
for (const f of fuentes) {
  const id = f.replace(/\.[^.]+$/, '')
  const destino = join(dirSalida, `${id}.webp`)
  if (!forzar && existsSync(destino)) {
    saltadas++
    continue
  }
  await sharp(join(dirEntrada, f))
    .resize(640, 640, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(destino)
  hechas++
}
console.log(`Comprimidas: ${hechas}. Ya existían: ${saltadas}. Total en public: ${readdirSync(dirSalida).length}`)
