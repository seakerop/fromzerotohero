import { useEffect, useId, useRef, useState } from 'react'
import { formatearFecha } from '../engine/fechas.js'
import { idioma, t } from '../i18n/idioma.js'

const ANCHO = 360
const MARGEN = { arriba: 18, abajo: 26, izq: 42, der: 14 }

function r1(v) {
  return Math.round(v * 10) / 10
}

function fmtValor(v) {
  const r = r1(v)
  const s = Number.isInteger(r) ? String(r) : r.toFixed(1)
  return idioma() === 'en' ? s : s.replace('.', ',')
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

// Gráfica de líneas por fecha. Pasar el ratón (o arrastrar el dedo) en
// cualquier punto del área engancha la fecha más cercana y muestra el valor
// de cada serie ese día, sin tener que acertar encima de un punto.
export default function GraficaLinea({ series, unidad, alto = 180 }) {
  const [foco, setFoco] = useState(null) // clave de fecha bajo el puntero
  const idBase = useId()
  const svgRef = useRef(null)

  // En táctil el tooltip se queda fijo tras levantar el dedo; se quita al
  // tocar fuera de la gráfica.
  useEffect(() => {
    if (!foco) return undefined
    const fuera = (e) => {
      if (svgRef.current && !svgRef.current.contains(e.target)) setFoco(null)
    }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [foco])

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
    return <p className="prog-gl-vacia texto-suave">{t('Aún no hay datos que dibujar.', 'No data to chart yet.')}</p>
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

  const fechas = [...new Set(todos.map((p) => p.x))].sort()

  function enfocarDesdePuntero(e) {
    const svg = svgRef.current
    const ctm = svg && svg.getScreenCTM()
    if (!ctm) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const { x } = pt.matrixTransform(ctm.inverse())
    let mejor = fechas[0]
    let distMejor = Infinity
    for (const f of fechas) {
      const d = Math.abs(px(f) - x)
      if (d < distMejor) {
        distMejor = d
        mejor = f
      }
    }
    if (mejor !== foco) setFoco(mejor)
  }

  // Valor de cada serie en la fecha enfocada (si hay dos sesiones ese día,
  // cuenta la última).
  const enFoco = foco
    ? visibles
        .map((s) => {
          const delDia = s.puntos.filter((p) => p.x === foco)
          return delDia.length ? { serie: s, punto: delDia[delDia.length - 1] } : null
        })
        .filter(Boolean)
    : []

  let guia = null
  if (foco && enFoco.length) {
    const gx = px(foco)
    const unidadTxt = unidad ? ` ${unidad}` : ''
    const lineas = enFoco.map(({ serie, punto }) =>
      visibles.length > 1 ? `${serie.nombre}: ${fmtValor(punto.y)}${unidadTxt}` : `${fmtValor(punto.y)}${unidadTxt}`
    )
    const cabecera = formatearFecha(foco)
    const anchoTip = Math.max(cabecera.length, ...lineas.map((l) => l.length + 2)) * 6.3 + 20
    const altoTip = 22 + lineas.length * 15
    const aLaDerecha = gx < (izq + der) / 2
    const tx = Math.min(Math.max(aLaDerecha ? gx + 10 : gx - anchoTip - 10, 2), ANCHO - anchoTip - 2)
    const ty = Math.min(arriba, abajo - altoTip)
    guia = (
      <g pointerEvents="none">
        <line x1={gx} y1={arriba - 4} x2={gx} y2={abajo} stroke="var(--texto-suave)" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="3 3" />
        {enFoco.map(({ serie, punto }) => (
          <circle
            key={serie.nombre}
            cx={gx}
            cy={py(punto.y)}
            r={serie.fino ? 3.4 : 5}
            fill={serie.color}
            stroke="var(--fondo, #0c0e13)"
            strokeWidth="2"
          />
        ))}
        <rect x={tx} y={ty} width={anchoTip} height={altoTip} rx="8" fill="var(--panel-2)" stroke="var(--oro)" strokeOpacity="0.55" />
        <text x={tx + 10} y={ty + 15} fontSize="10" fill="var(--texto-suave)">
          {cabecera}
        </text>
        {enFoco.map(({ serie }, i) => (
          <g key={serie.nombre}>
            <circle cx={tx + 13} cy={ty + 26 + i * 15} r="3" fill={serie.color} />
            <text x={tx + 21} y={ty + 30 + i * 15} fontSize="11.5" fontWeight="700" fill="var(--texto)">
              {lineas[i]}
            </text>
          </g>
        ))}
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
        ref={svgRef}
        viewBox={`0 0 ${ANCHO} ${alto}`}
        preserveAspectRatio="xMidYMid meet"
        className="prog-gl-svg"
        role="img"
        aria-label={t(
          `Gráfica de ${visibles.map((s) => s.nombre).join(' y ')}`,
          `Chart of ${visibles.map((s) => s.nombre).join(' and ')}`
        )}
        onPointerMove={enfocarDesdePuntero}
        onPointerDown={enfocarDesdePuntero}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setFoco(null)
        }}
      >
        <defs>
          {visibles.map((s, si) => (
            <linearGradient key={si} id={`${idBase}-area-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {/* Área de captura: todo el lienzo responde al puntero */}
        <rect x="0" y="0" width={ANCHO} height={alto} fill="transparent" />
        {marcas.map((m) => (
          <g key={m} pointerEvents="none">
            <line x1={izq} y1={py(m)} x2={der} y2={py(m)} stroke="var(--borde)" strokeWidth="1" strokeOpacity="0.55" strokeDasharray="2 5" />
            <text x={izq - 6} y={py(m) + 3.5} textAnchor="end" fontSize="10" fill="var(--texto-suave)">
              {fmtValor(m)}
            </text>
          </g>
        ))}
        <line x1={izq} y1={abajo} x2={der} y2={abajo} stroke="var(--borde)" strokeWidth="1" pointerEvents="none" />
        <g pointerEvents="none">
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
        </g>
        {visibles.map((s, si) => {
          const pts = s.puntos.map((p) => ({ px: px(p.x), py: py(p.y) }))
          const camino = caminoSuave(pts)
          const ultima = s.puntos[s.puntos.length - 1]
          const muchos = s.puntos.length > 24
          return (
            <g key={s.nombre} pointerEvents="none">
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
                    />
                  </g>
                )
              })}
              {!s.fino && !foco && (
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
        {guia}
      </svg>
    </div>
  )
}
