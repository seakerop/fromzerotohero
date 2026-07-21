#!/usr/bin/env node
// Genera los iconos PNG de FromZeroToHero (CONTRACT.md §19) con Node puro:
// encoder PNG propio (IHDR/IDAT con zlib.deflateSync + CRC32, filtro 0) sobre
// un buffer RGBA, con antialias por supersampling x4. Sin dependencias.
//
// Uso: node scripts/gen-iconos.mjs

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO = join(RAIZ, 'public', 'iconos')

// ---------- colores (design system, base.css) ----------

const FONDO = [12, 14, 19] // #0c0e13
const PANEL = [21, 24, 36] // #151824 (viñeta sutil del fondo)
const ORO = [217, 164, 65] // #d9a441
const ORO_CLARO = [240, 200, 110] // #f0c86e (punta de flecha)

// ---------- geometría de la mancuerna ----------
// Coordenadas de arte con |u| <= 0.9 y |v| <= 0.4. El eje u es el eje de la
// barra, inclinado 30° ascendente: la barra sale del disco derecho y termina
// en punta de flecha. Subir es la dirección del viaje.

const BARRA = { u0: -0.895, u1: 0.615, vMitad: 0.07, radio: 0.055 }
const DISCOS = [
  { u: -0.795, uMitad: 0.08, vMitad: 0.28, radio: 0.06 },
  { u: -0.595, uMitad: 0.09, vMitad: 0.4, radio: 0.07 },
  { u: 0.125, uMitad: 0.09, vMitad: 0.4, radio: 0.07 },
  { u: 0.325, uMitad: 0.08, vMitad: 0.28, radio: 0.06 },
]
const FLECHA = { base: 0.535, punta: 0.895, vMitad: 0.24 }

const INCLINACION = Math.PI / 6 // 30° ascendente
const COS = Math.cos(INCLINACION)
const SEN = Math.sin(INCLINACION)

function dentroCajaRedondeada(du, dv, uMitad, vMitad, radio) {
  const au = Math.abs(du)
  const av = Math.abs(dv)
  if (au > uMitad || av > vMitad) return false
  const qu = au - (uMitad - radio)
  const qv = av - (vMitad - radio)
  if (qu <= 0 || qv <= 0) return true
  return qu * qu + qv * qv <= radio * radio
}

function dentroMancuerna(u, v) {
  const centroBarra = (BARRA.u0 + BARRA.u1) / 2
  const mitadBarra = (BARRA.u1 - BARRA.u0) / 2
  if (dentroCajaRedondeada(u - centroBarra, v, mitadBarra, BARRA.vMitad, BARRA.radio)) return true
  for (const disco of DISCOS) {
    if (dentroCajaRedondeada(u - disco.u, v, disco.uMitad, disco.vMitad, disco.radio)) return true
  }
  return false
}

function dentroFlecha(u, v) {
  if (u < FLECHA.base || u > FLECHA.punta) return false
  const mitad = (FLECHA.vMitad * (FLECHA.punta - u)) / (FLECHA.punta - FLECHA.base)
  return Math.abs(v) <= mitad
}

// ---------- render RGBA con supersampling x4 ----------

function renderizar(tam, fraccionEsquina, fraccionArte) {
  const SS = 4
  const paso = 1 / SS
  const subMuestras = SS * SS
  const radioEsquina = fraccionEsquina * tam
  const escalaArte = fraccionArte * tam
  const centro = tam / 2
  const rgba = Buffer.alloc(tam * tam * 4)

  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      let sumaR = 0
      let sumaG = 0
      let sumaB = 0
      let cubiertas = 0
      for (let j = 0; j < SS; j++) {
        for (let i = 0; i < SS; i++) {
          const px = x + (i + 0.5) * paso
          const py = y + (j + 0.5) * paso

          if (radioEsquina > 0) {
            const qx = Math.max(radioEsquina - px, px - (tam - radioEsquina), 0)
            const qy = Math.max(radioEsquina - py, py - (tam - radioEsquina), 0)
            if (qx * qx + qy * qy > radioEsquina * radioEsquina) continue // fuera del fondo redondeado
          }

          const ejeX = px - centro
          const ejeY = centro - py
          const u = (ejeX * COS + ejeY * SEN) / escalaArte
          const v = (-ejeX * SEN + ejeY * COS) / escalaArte

          let r
          let g
          let b
          if (dentroFlecha(u, v)) {
            ;[r, g, b] = ORO_CLARO
          } else if (dentroMancuerna(u, v)) {
            ;[r, g, b] = ORO
          } else {
            // viñeta sutil: el fondo respira un poco hacia --panel en el centro
            const t = Math.max(0, 1 - Math.hypot(ejeX, ejeY) / centro) * 0.55
            r = FONDO[0] + (PANEL[0] - FONDO[0]) * t
            g = FONDO[1] + (PANEL[1] - FONDO[1]) * t
            b = FONDO[2] + (PANEL[2] - FONDO[2]) * t
          }
          sumaR += r
          sumaG += g
          sumaB += b
          cubiertas++
        }
      }
      if (cubiertas === 0) continue // píxel transparente (Buffer.alloc ya es 0)
      const idx = (y * tam + x) * 4
      rgba[idx] = Math.round(sumaR / cubiertas)
      rgba[idx + 1] = Math.round(sumaG / cubiertas)
      rgba[idx + 2] = Math.round(sumaB / cubiertas)
      rgba[idx + 3] = Math.round((cubiertas / subMuestras) * 255)
    }
  }
  return rgba
}

// ---------- encoder PNG mínimo (filtro 0, RGBA 8 bits) ----------

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabla[n] = c >>> 0
  }
  return tabla
})()

function crc32(datos) {
  let c = 0xffffffff
  for (let i = 0; i < datos.length; i++) c = TABLA_CRC[(c ^ datos[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function trozo(tipo, datos) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length, 0)
  const nombre = Buffer.from(tipo, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([nombre, datos])), 0)
  return Buffer.concat([largo, nombre, datos, crc])
}

function codificarPNG(ancho, alto, rgba) {
  const firma = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(ancho, 0)
  ihdr.writeUInt32BE(alto, 4)
  ihdr[8] = 8 // profundidad de bit
  ihdr[9] = 6 // tipo de color: RGBA
  ihdr[10] = 0 // compresión
  ihdr[11] = 0 // filtro
  ihdr[12] = 0 // sin entrelazado

  // scanlines con byte de filtro 0 delante de cada fila
  const anchoFila = ancho * 4
  const crudo = Buffer.alloc((anchoFila + 1) * alto)
  for (let y = 0; y < alto; y++) {
    crudo[y * (anchoFila + 1)] = 0
    rgba.copy(crudo, y * (anchoFila + 1) + 1, y * anchoFila, (y + 1) * anchoFila)
  }
  const idat = deflateSync(crudo, { level: 9 })

  return Buffer.concat([firma, trozo('IHDR', ihdr), trozo('IDAT', idat), trozo('IEND', Buffer.alloc(0))])
}

// ---------- generación ----------

const ICONOS = [
  // esquinas redondeadas al 19% del lado; el arte ocupa ~72% del ancho
  { fichero: 'icono-180.png', tam: 180, fraccionEsquina: 0.19, fraccionArte: 0.36 },
  { fichero: 'icono-192.png', tam: 192, fraccionEsquina: 0.19, fraccionArte: 0.36 },
  { fichero: 'icono-512.png', tam: 512, fraccionEsquina: 0.19, fraccionArte: 0.36 },
  // maskable: fondo a sangre (sin transparencia) y arte con 20% de margen por lado
  { fichero: 'icono-512-maskable.png', tam: 512, fraccionEsquina: 0, fraccionArte: 0.3 },
]

mkdirSync(DESTINO, { recursive: true })
for (const { fichero, tam, fraccionEsquina, fraccionArte } of ICONOS) {
  const rgba = renderizar(tam, fraccionEsquina, fraccionArte)
  const png = codificarPNG(tam, tam, rgba)
  writeFileSync(join(DESTINO, fichero), png)
  console.log(`✓ ${fichero} — ${tam}x${tam}, ${png.length} bytes`)
}
console.log(`Iconos generados en ${DESTINO}`)
