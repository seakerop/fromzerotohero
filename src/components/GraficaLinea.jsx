import { useState } from 'react'
import { formatearFecha } from '../engine/fechas.js'

const ANCHO = 360
const MARGEN = { arriba: 14, abajo: 26, izq: 42, der: 12 }

function r1(v) {
  return Math.round(v * 10) / 10
}

function fmtValor(v) {
  const r = r1(v)
  return (Number.isInteger(r) ? String(r) : r.toFixed(1)).replace('.', ',')
}

/* 3-5 marcas redondas que cubren [min, max] con pasos 1/2/2.5/5 × 10^k */
function marcasRedondas(minV, maxV) {
  let min = minV
  let max = maxV
  if (min === max) {
    min = Math.max(0, min - 1)
    max = max + 1
  }
  const bruto = (max - min) / 3
  const pot = Math.pow(10, Math.floor(Math.log10(bruto)))
  let paso = 10 * pot
  for (const c of [1, 2, 2.5, 5, 10]) {
    if (c * pot >= bruto) {
      paso = c * pot
      break
    }
  }
  const desde = Math.floor(min / paso) * paso
  const marcas = []
  for (let i = 0; i < 10; i++) {
    const v = Math.round((desde + i * paso) * 1000) / 1000
    marcas.push(v)
    if (v >= max - paso / 1000) break
  }
  return marcas
}

/* Catmull-Rom → curvas Bézier para una línea suave que pasa por todos los puntos */
function caminoSuave(pts) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].px} ${pts[0].py}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = r1(p1.px + (p2.px - p0.px) / 6)
    const c1y = r1(p1.py + (p2.py - p0.py) / 6)
    const c2x = r1(p2.px - (p3.px - p1.px) / 6)
    const c2y = r1(p2.py - (p3.py - p1.py) / 6)
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.px} ${p2.py}`
  }
  return d
}

export default function GraficaLinea({ series, unidad, alto = 180 }) {
  const [sel, setSel] = useState(null)

  const visibles = (series || [])
    .map((s) => ({
      ...s,
      puntos: (s.puntos || [])
        .filter((p) => p.y != null)
        .slice()
        .sort((a, b) => (a.x < b.x ? -1 : a.x > b.x ? 1 : 0)),
    }))
    .filter((s) => s.puntos.length > 0)

  const todos = visibles.flatMap((s) => s.puntos)
  if (!todos.length) {
    return <p className="prog-gl-vacia texto-suave">Aún no hay datos que dibujar.</p>
  }

  let claveMin = todos[0].x
  let claveMax = todos[0].x
  let yMinDato = todos[0].y
  let yMaxDato = todos[0].y
  for (const p of todos) {
    if (p.x < claveMin) claveMin = p.x
    if (p.x > claveMax) claveMax = p.x
    if (p.y < yMinDato) yMinDato = p.y
    if (p.y > yMaxDato) yMaxDato = p.y
  }

  const marcas = marcasRedondas(yMinDato, yMaxDato)
  const yMin = marcas[0]
  const yMax = marcas[marcas.length - 1]
  const xMin = Date.parse(claveMin)
  const xMax = Date.parse(claveMax)

  const izq = MARGEN.izq
  const der = ANCHO - MARGEN.der
  const arriba = MARGEN.arriba
  const abajo = alto - MARGEN.abajo

  const px = (x) => {
    if (xMax === xMin) return r1((izq + der) / 2)
    return r1(izq + ((Date.parse(x) - xMin) / (xMax - xMin)) * (der - izq))
  }
  const py = (y) => r1(abajo - ((y - yMin) / (yMax - yMin)) * (abajo - arriba))

  let tooltip = null
  if (sel && visibles[sel.si] && visibles[sel.si].puntos[sel.pi]) {
    const p = visibles[sel.si].puntos[sel.pi]
    const linea1 = `${fmtValor(p.y)}${unidad ? ` ${unidad}` : ''}`
    const linea2 = formatearFecha(p.x)
    const anchoTip = Math.max(linea1.length, linea2.length) * 6.6 + 18
    const cx = px(p.x)
    const cy = py(p.y)
    const tx = Math.min(Math.max(cx - anchoTip / 2, 4), ANCHO - anchoTip - 4)
    const ty = cy - 46 < 2 ? cy + 14 : cy - 46
    tooltip = (
      <g pointerEvents="none">
        <rect x={tx} y={ty} width={anchoTip} height={36} rx="7" fill="var(--panel-2)" stroke="var(--borde)" />
        <text x={tx + anchoTip / 2} y={ty + 15} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--texto)">
          {linea1}
        </text>
        <text x={tx + anchoTip / 2} y={ty + 29} textAnchor="middle" fontSize="10" fill="var(--texto-suave)">
          {linea2}
        </text>
      </g>
    )
  }

  return (
    <div className="prog-gl">
      {visibles.length > 1 && (
        <div className="prog-gl-leyenda">
          {visibles.map((s) => (
            <span key={s.nombre} className="prog-gl-leyenda-item">
              <span className="prog-gl-leyenda-punto" style={{ background: s.color }} />
              {s.nombre}
            </span>
          ))}
        </div>
      )}
      <svg
        viewBox={`0 0 ${ANCHO} ${alto}`}
        preserveAspectRatio="xMidYMid meet"
        className="prog-gl-svg"
        role="img"
        aria-label={`Gráfica de ${visibles.map((s) => s.nombre).join(' y ')}`}
        onClick={() => setSel(null)}
      >
        {marcas.map((m) => (
          <g key={m}>
            <line x1={izq} y1={py(m)} x2={der} y2={py(m)} stroke="var(--borde)" strokeWidth="1" strokeDasharray="3 4" />
            <text x={izq - 6} y={py(m) + 3.5} textAnchor="end" fontSize="10" fill="var(--texto-suave)">
              {fmtValor(m)}
            </text>
          </g>
        ))}
        <text x={izq} y={alto - 7} fontSize="10" fill="var(--texto-suave)">
          {formatearFecha(claveMin)}
        </text>
        {claveMax !== claveMin && (
          <text x={der} y={alto - 7} textAnchor="end" fontSize="10" fill="var(--texto-suave)">
            {formatearFecha(claveMax)}
          </text>
        )}
        {visibles.map((s, si) => (
          <g key={s.nombre}>
            {s.puntos.length > 1 && (
              <path
                d={caminoSuave(s.puntos.map((p) => ({ px: px(p.x), py: py(p.y) })))}
                fill="none"
                stroke={s.color}
                strokeWidth={s.fino ? 1.4 : 2.6}
                strokeOpacity={s.fino ? 0.45 : 1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {s.puntos.map((p, pi) => {
              const cx = px(p.x)
              const cy = py(p.y)
              const activo = sel && sel.si === si && sel.pi === pi
              return (
                <g key={`${p.x}-${pi}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={s.fino ? 2.2 : 3.4}
                    fill={s.color}
                    fillOpacity={s.fino ? 0.55 : 1}
                    stroke={activo ? 'var(--texto)' : 'none'}
                    strokeWidth={activo ? 1.5 : 0}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="transparent"
                    onClick={(ev) => {
                      ev.stopPropagation()
                      setSel(activo ? null : { si, pi })
                    }}
                  />
                </g>
              )
            })}
          </g>
        ))}
        {tooltip}
      </svg>
    </div>
  )
}
