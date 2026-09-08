// Genera las ilustraciones de ejercicios con la API de Gemini, usando las
// imágenes de arte/referencia como referencia de estilo (mismo maniquí).
//
// Requisitos:
//   - arte/referencia/  con 1-3 imágenes del maniquí maestro (png/jpg/webp)
//   - GEMINI_API_KEY en .env.local (o como variable de entorno)
//
// Uso:
//   node scripts/gen-imagenes.mjs              # genera todo lo que falte
//   node scripts/gen-imagenes.mjs --listar     # muestra qué falta, sin llamar a la API
//   node scripts/gen-imagenes.mjs --solo sentadilla-goblet
//   node scripts/gen-imagenes.mjs --limite 10
//   node scripts/gen-imagenes.mjs --modelo gemini-2.5-flash-image
//
// Es reanudable: salta los ejercicios que ya tienen imagen en arte/ejercicios.
// Para regenerar uno, borra su png y vuelve a ejecutar (o usa --solo tras borrarlo).

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESTILO, PROMPTS } from './prompts-imagenes.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const dirReferencia = join(raiz, 'arte', 'referencia')
const dirSalida = join(raiz, 'arte', 'ejercicios')

const args = process.argv.slice(2)
const leerArg = (nombre) => {
  const i = args.indexOf(nombre)
  return i >= 0 ? args[i + 1] : null
}
const soloListar = args.includes('--listar')
const solo = leerArg('--solo')
const limite = Number(leerArg('--limite')) || Infinity
const modelo = leerArg('--modelo') || process.env.GEMINI_MODEL || 'gemini-2.5-flash-image'

const PAUSA_MS = Number(process.env.GEMINI_PAUSA_MS) || 7000 // free tier: ~10 peticiones/minuto
const ESPERAS_REINTENTO_S = [20, 45, 90, 180]

function leerClave() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim()
  const ruta = join(raiz, '.env.local')
  if (existsSync(ruta)) {
    const m = readFileSync(ruta, 'utf8').match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/m)
    if (m) return m[1].replace(/^["']|["']$/g, '')
  }
  return null
}

const MIMES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }

function leerReferencias() {
  if (!existsSync(dirReferencia)) return []
  return readdirSync(dirReferencia)
    .filter((f) => MIMES[extname(f).toLowerCase()])
    .sort()
    .map((f) => ({
      inlineData: {
        mimeType: MIMES[extname(f).toLowerCase()],
        data: readFileSync(join(dirReferencia, f)).toString('base64'),
      },
    }))
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

async function pedirImagen(clave, referencias, prompt, conFormato = true) {
  const cuerpo = {
    contents: [{ parts: [...referencias, { text: prompt }] }],
    generationConfig: conFormato
      ? { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: '1:1' } }
      : { responseModalities: ['TEXT', 'IMAGE'] },
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
      body: JSON.stringify(cuerpo),
    },
  )
  if (res.status === 400 && conFormato) {
    // algunos modelos no aceptan imageConfig: reintentar sin él
    return pedirImagen(clave, referencias, prompt, false)
  }
  if (!res.ok) {
    const texto = await res.text().catch(() => '')
    const err = new Error(`HTTP ${res.status}: ${texto.slice(0, 300)}`)
    err.status = res.status
    throw err
  }
  const json = await res.json()
  const partes = json.candidates?.[0]?.content?.parts || []
  const img = partes.find((p) => p.inlineData?.data)
  if (!img) {
    const motivo = json.candidates?.[0]?.finishReason || json.promptFeedback?.blockReason || 'sin imagen en la respuesta'
    throw new Error(`La API no devolvió imagen (${motivo})`)
  }
  return Buffer.from(img.inlineData.data, 'base64')
}

async function generarUno(clave, referencias, ejercicio) {
  const prompt = ESTILO.replace('{DESC}', ejercicio.desc)
  for (let intento = 0; ; intento++) {
    try {
      return await pedirImagen(clave, referencias, prompt)
    } catch (err) {
      const recuperable = err.status === 429 || err.status === 500 || err.status === 503
      if (!recuperable || intento >= ESPERAS_REINTENTO_S.length) throw err
      const espera = ESPERAS_REINTENTO_S[intento]
      console.log(`   … ${err.status}: esperando ${espera}s y reintentando`)
      await dormir(espera * 1000)
    }
  }
}

// ── main ─────────────────────────────────────────────────────────────
const orden = [...PROMPTS].sort((a, b) => (b.plantilla ? 1 : 0) - (a.plantilla ? 1 : 0))
const pendientes = orden.filter(
  (e) => (!solo || e.id === solo) && !existsSync(join(dirSalida, `${e.id}.png`)),
)

console.log(`Modelo: ${modelo}`)
console.log(`Pendientes: ${pendientes.length} de ${PROMPTS.length}`)
if (soloListar) {
  for (const e of pendientes) console.log(` - ${e.id}${e.plantilla ? '' : '  (no plantilla)'}`)
  process.exit(0)
}
if (!pendientes.length) {
  console.log('Nada que generar. Borra un png de arte/ejercicios para regenerarlo.')
  process.exit(0)
}

const clave = leerClave()
if (!clave) {
  console.error('Falta GEMINI_API_KEY. Ponla en .env.local (GEMINI_API_KEY=...) o como variable de entorno.')
  process.exit(1)
}
const referencias = leerReferencias()
if (!referencias.length) {
  console.error(`No hay imágenes de referencia en ${dirReferencia}. Copia ahí el maniquí maestro.`)
  process.exit(1)
}
console.log(`Referencias de estilo: ${referencias.length}`)

mkdirSync(dirSalida, { recursive: true })
let hechos = 0
const fallos = []
for (const e of pendientes) {
  if (hechos >= limite) break
  process.stdout.write(`[${hechos + 1}/${Math.min(pendientes.length, limite)}] ${e.id} … `)
  try {
    const png = await generarUno(clave, referencias, e)
    writeFileSync(join(dirSalida, `${e.id}.png`), png)
    console.log(`✓ (${Math.round(png.length / 1024)} KB)`)
    hechos++
  } catch (err) {
    console.log(`✗ ${err.message}`)
    fallos.push(e.id)
    if (err.status === 429) {
      console.log('Parece límite diario del free tier: vuelve a ejecutar el script más tarde, continuará donde lo dejó.')
      break
    }
  }
  await dormir(PAUSA_MS)
}

console.log(`\nGeneradas: ${hechos}. Fallos: ${fallos.length}${fallos.length ? ` (${fallos.join(', ')})` : ''}`)
const faltan = PROMPTS.filter((e) => !existsSync(join(dirSalida, `${e.id}.png`)))
console.log(faltan.length ? `Aún faltan ${faltan.length}. Ejecuta de nuevo para continuar.` : '¡Lote completo! 🎉')
