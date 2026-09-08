import { useId, useState } from 'react'
import { formatearFecha } from '../engine/fechas.js'

const ANCHO = 360
const MARGEN = { arriba: 18, abajo: 26, izq: 42, der: 14 }

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

/* Catmull-Rom → Bézier, con los controles ACOTADOS al tramo en x: las fechas
   no van equiespaciadas y sin esta cota la curva retrocedía en el tiempo
   tras un hueco grande entre registros. Con c1x ≤ c2x dentro de [p1, p2],
   x(t) es monótona y la línea solo avanza. */
function caminoSuave(pts) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].px} ${pts[0].py}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    let c1x = p1.px + (p2.px - p0.px) / 6
    let c2x = p2.px - (p3.px - p1.px) / 6
    c1x = Math.min(Math.max(c1x, p1.px), p2.px)
    c2x = Math.min(Math.max(c2x, c1x), p2.px)
    const c1y = r1(p1.py + (p2.py - p0.py) / 6)
    const c2y = r1(p2.py - (p3.py - p1.py) / 6)
    d += ` C ${r1(c1x)} ${c1y}, ${r1(c2x)} ${c2y}, ${p2.px} ${p2.py}`
  }
  return d
}

export default function GraficaLinea({ series, unidad, alto = 180 }) {
  const [sel, setSel] = useState(null)
  const idBase = useId()

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

  // Fecha intermedia solo si el rango da aire (evita solapes en rangos cortos)
  const diasRango = (xMax - xMin) / 86400000
  const fechaMedia = diasRango > 21 ? new Date((xMin + xMax) / 2).toISOString().slice(0, 10) : null

  let tooltip = null
  if (sel && visibles[sel.si] && visibles[sel.si].puntos[sel.pi]) {
    const p = visibles[sel.si].puntos[sel.pi]
    const linea1 = `${fmtValor(p.y)}${unidad ? ` ${unidad}` : ''}`
    const linea2 = formatearFecha(p.x)
    const anchoTip = Math.max(linea1.length, linea2.length) * 6.6 + 18
    const cx = px(p.x)
    const cy = py(p.y)
    const tx = Math.min(Math.max(cx - anchoTip / 2, 4), ANCHO - anchoTip - 4)
    const ty = cy - 48 < 2 ? cy + 14 : cy - 48
    tooltip = (
      <g pointerEvents="none">
        <rect x={tx} y={ty} width={anchoTip} height={38} rx="8" fill="var(--panel-2)" stroke="var(--oro)" strokeOpacity="0.55" />
        <text x={tx + anchoTip / 2} y={ty + 16} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--oro-claro)">
          {linea1}
        </text>
        <text x={tx + anchoTip / 2} y={ty + 30} textAnchor="middle" fontSize="10" fill="var(--texto-suave)">
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
        <defs>
          {visibles.map((s, si) => (
            <linearGradient key={si} id={`${idBase}-area-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {marcas.map((m) => (
          <g key={m}>
            <line x1={izq} y1={py(m)} x2={der} y2={py(m)} stroke="var(--borde)" strokeWidth="1" strokeOpacity="0.55" strokeDasharray="2 5" />
            <text x={izq - 6} y={py(m) + 3.5} textAnchor="end" fontSize="10" fill="var(--texto-suave)">
              {fmtValor(m)}
            </text>
          </g>
        ))}
        <line x1={izq} y1={abajo} x2={der} y2={abajo} stroke="var(--borde)" strokeWidth="1" />
        <text x={izq} y={alto - 7} fontSize="10" fill="var(--texto-suave)">
          {formatearFecha(claveMin)}
        </text>
        {fechaMedia && (
          <text x={(izq + der) / 2} y={alto - 7} textAnchor="middle" fontSize="10" fill="var(--texto-suave)" opacity="0.8">
            {formatearFecha(fechaMedia)}
          </text>
        )}
        {claveMax !== claveMin && (
          <text x={der} y={alto - 7} textAnchor="end" fontSize="10" fill="var(--texto-suave)">
            {formatearFecha(claveMax)}
          </text>
        )}
        {visibles.map((s, si) => {
          const pts = s.puntos.map((p) => ({ px: px(p.x), py: py(p.y) }))
          const camino = caminoSuave(pts)
          const ultima = s.puntos[s.puntos.length - 1]
          const muchos = s.puntos.length > 24
          return (
            <g key={s.nombre}>
              {!s.fino && s.puntos.length > 1 && (
                <path
                  d={`${camino} L ${pts[pts.length - 1].px} ${abajo} L ${pts[0].px} ${abajo} Z`}
                  fill={`url(#${idBase}-area-${si})`}
                  stroke="none"
                />
              )}
              {s.puntos.length > 1 && (
                <path
                  d={camino}
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
                const esUltimo = pi === s.puntos.length - 1 && !s.fino
                return (
                  <g key={`${p.x}-${pi}`}>
                    {esUltimo && (
                      <circle cx={cx} cy={cy} r="7.5" fill="none" stroke={s.color} strokeWidth="1.2" strokeOpacity="0.45" />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={s.fino ? 2.2 : esUltimo ? 4 : muchos ? 2.6 : 3.4}
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
              {!s.fino && !sel && (
                <text
                  x={Math.min(px(ultima.x) + 10, ANCHO - 4)}
                  y={Math.max(py(ultima.y) - 8, 12)}
                  textAnchor={px(ultima.x) > ANCHO - 56 ? 'end' : 'start'}
                  fontSize="11.5"
                  fontWeight="700"
                  fill={s.color}
                >
                  {fmtValor(ultima.y)}
                </text>
              )}
            </g>
          )
        })}
        {tooltip}
      </svg>
    </div>
  )
}
