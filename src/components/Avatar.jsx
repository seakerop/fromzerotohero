import { etapaArbol } from '../data/arbol.js'

// El Árbol del Héroe, versión CONTINUA: la geometría entera (altura, grosor,
// hojas, ramas, copa, flores, frutos, oro) se deriva de los días de acción,
// así que el árbol cambia un poco casi cada día — sin saltos entre etapas.
// Las 15 etapas con nombre (data/arbol.js) quedan como hitos, no como dibujos.
// Regla de oro intacta: nunca se marchita, crece o espera.

const VERDE_OSCURO = '#3f6b34'
const VERDE = '#4e8140'
const VERDE_CLARO = '#5d9a4c'
const VERDE_VIVO = '#6fb35a'
const VERDE_TIERNO = '#8fbf74'
const TRONCO = '#7c5f3e'
const TRONCO_OSCURO = '#5f4830'
const ORO = '#d9a441'
const ORO_CLARO = '#f0c86e'
const SEMILLA = '#b8905a'
const RAIZ = '#d8cdb8'

const SUELO_Y = 81

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1)

function mezclar(hexA, hexB, t) {
  const a = [1, 3, 5].map((i) => parseInt(hexA.slice(i, i + 2), 16))
  const b = [1, 3, 5].map((i) => parseInt(hexB.slice(i, i + 2), 16))
  const c = a.map((x, i) => Math.round(lerp(x, b[i], t)))
  return `#${c.map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

function Chispa({ x, y, r = 3, color = ORO_CLARO, opacidad = 1 }) {
  const p = `M ${x} ${y - r} L ${x + r * 0.35} ${y - r * 0.35} L ${x + r} ${y} L ${x + r * 0.35} ${y + r * 0.35} L ${x} ${y + r} L ${x - r * 0.35} ${y + r * 0.35} L ${x - r} ${y} L ${x - r * 0.35} ${y - r * 0.35} Z`
  return <path d={p} fill={color} opacity={opacidad} />
}

// Ramas: g0 = punto de crecimiento en el que nace cada una (≈ días 30, 47,
// 69, 100, 144, 199). frac = altura del anclaje en el tronco (0 = base).
const RAMAS = [
  { g0: 0.16, lado: -1, frac: 0.9 },
  { g0: 0.24, lado: 1, frac: 0.78 },
  { g0: 0.33, lado: -1, frac: 0.64 },
  { g0: 0.43, lado: 1, frac: 0.5 },
  { g0: 0.55, lado: -1, frac: 0.38 },
  { g0: 0.68, lado: 1, frac: 0.29 },
]

// Hojas sueltas del tallo joven: van saliendo una a una (día 14, 17, 20…)
// y se desvanecen cuando la copa toma el relevo.
const HOJAS_TALLO = [
  { frac: 0.62, lado: -1, rot: -34 },
  { frac: 0.74, lado: 1, rot: 32 },
  { frac: 0.5, lado: 1, rot: 28 },
  { frac: 0.86, lado: -1, rot: -28 },
  { frac: 0.4, lado: -1, rot: -24 },
  { frac: 0.94, lado: 1, rot: 24 },
]

// Posiciones normalizadas dentro de la copa (se escalan con su tamaño).
const FLORES = [
  [-0.75, -0.2], [0.15, -0.85], [0.7, -0.1], [-0.35, 0.45], [0.45, 0.5],
  [-0.95, 0.25], [0.95, 0.3], [-0.1, -0.35], [0.35, -0.55],
]
const FRUTOS = [[-0.55, 0.6], [0.3, 0.75], [0.85, 0.35], [-0.9, 0.3], [0, 0.5], [0.6, -0.3]]
const LUCIERNAGAS = [[34, 52, 0.9], [86, 47, 0.7], [40, 38, 0.8], [82, 66, 0.6]]

function Subsuelo({ d }) {
  // Días 0-13: semilla → despertar → germen empujando hacia la superficie.
  const crack = clamp((d - 2) / 2, 0, 1)
  const raizLargo = lerp(0, 12, (d - 3) / 11)
  const brote = d >= 7
  const broteY = lerp(85, 78.2, (d - 7) / 7) // el germen sube día a día
  return (
    <g>
      <path d="M 49 80 Q 60 74.5 71 80 Q 60 84.5 49 80 Z" fill="#242015" />
      <ellipse cx="60" cy={d >= 7 ? 87 : 78.8} rx={d >= 7 ? 3.4 : 4.2} ry={d >= 7 ? 4.4 : 5.6}
        fill={SEMILLA} opacity={d >= 7 ? 0.8 : 1} />
      {crack > 0 && !brote && (
        <path d="M 58.4 74.4 L 60.2 77 L 58.9 79.6 L 60.6 82" fill="none"
          stroke="#4a3823" strokeWidth="1" opacity={crack} />
      )}
      {d >= 3 && (
        <path d={`M 60 ${brote ? 90.5 : 84} q -1 ${raizLargo * 0.4} 0.6 ${raizLargo}`}
          fill="none" stroke={RAIZ} strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      )}
      {brote && (
        <g>
          <path d={`M 60.5 85 Q 57.5 ${broteY + 3.5} 58.2 ${broteY + 1} Q 58.6 ${broteY} 60 ${broteY}`}
            fill="none" stroke={VERDE_TIERNO} strokeWidth="2" strokeLinecap="round" />
          <circle cx="60.2" cy={broteY} r="1.5" fill="#a7d68a" />
        </g>
      )}
      <Chispa x={60} y={d >= 7 ? 65 : 63.5} r={lerp(2.4, 3, d / 13)} opacidad={0.9} />
    </g>
  )
}

function Arbol({ d }) {
  // Curva de crecimiento: 0 en el día 14, 1 en el día 365 (después solo
  // cambia la luz: oro, aura, estrellas). Exponente <1 = arranque más visible.
  const g = clamp(Math.pow((d - 14) / 351, 0.6), 0, 1)

  const altura = lerp(6, 46, g)
  const topeY = SUELO_Y - altura
  const grosor = lerp(1.4, 7.5, Math.pow(g, 0.9))
  const colorTallo = mezclar(VERDE_CLARO, TRONCO, clamp(g / 0.22, 0, 1))

  const oroT = clamp((d - 340) / 60, 0, 1)          // el dorado entra en fundido
  const auraT = clamp((d - 365) / 40, 0, 1)
  const raicesT = clamp((d - 100) / 50, 0, 1)        // raíces hondas: fundido 100→150
  const nFlores = d >= 190 ? clamp(Math.floor((d - 190) / 8) + 1, 1, FLORES.length) : 0
  const nFrutos = d >= 240 ? clamp(Math.floor((d - 240) / 12) + 1, 1, FRUTOS.length) : 0
  const nLuciernagas = d >= 365 ? clamp(Math.floor((d - 365) / 20) + 1, 1, 4) : 0

  // Copa: cúmulo superior + uno por rama crecida + dos laterales de relleno.
  const cumulos = []
  if (g > 0.045) cumulos.push([60, topeY + 1, lerp(2.2, 13, g), VERDE])
  RAMAS.forEach((r, i) => {
    const cr = clamp((g - r.g0) * 55, 0, 15 + 9 * (1 - r.frac))
    if (cr <= 2) return
    const ancX = 60 + r.lado * grosor * 0.4
    const ancY = SUELO_Y - altura * r.frac
    const tipX = ancX + r.lado * cr * 0.85
    const tipY = ancY - cr * 0.55
    const radio = clamp((g - r.g0) * 34, 2, 8.5 + 5 * (1 - r.frac))
    cumulos.push([tipX, tipY, radio, [VERDE_OSCURO, VERDE_CLARO, VERDE, VERDE_VIVO][i % 4], { ancX, ancY, tipX, tipY, cr }])
  })
  if (g > 0.5) {
    const rl = clamp((g - 0.5) * 20, 0, 10)
    cumulos.push([60 - (9 + 6 * g), topeY + 8, rl, VERDE_OSCURO])
    cumulos.push([60 + (9 + 6 * g), topeY + 7, rl, VERDE_CLARO])
  }

  // Centro y radio efectivo de la copa (para colocar flores y frutos).
  const copaX = 60
  const copaY = topeY + 5
  const copaR = lerp(6, 21, g)

  const colorRaiz = mezclar(TRONCO_OSCURO, ORO, oroT * 0.7)

  return (
    <g>
      {raicesT > 0 && (
        <g opacity={raicesT}>
          <path d={`M ${60 - grosor} 80 Q ${52 - grosor} 84 ${47 - grosor} 90`} fill="none"
            stroke={colorRaiz} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d={`M ${60 + grosor} 80 Q ${68 + grosor} 84 ${73 + grosor} 90`} fill="none"
            stroke={colorRaiz} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M 60 82 Q 59 89 60 96" fill="none"
            stroke={colorRaiz} strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
        </g>
      )}

      {/* tronco (de brizna a tronco sin cambiar de forma) */}
      <path
        d={`M ${60 - grosor} ${SUELO_Y} Q ${60 - grosor * 0.55} ${SUELO_Y - altura * 0.5} ${60 - grosor * 0.45} ${topeY}
            L ${60 + grosor * 0.45} ${topeY} Q ${60 + grosor * 0.55} ${SUELO_Y - altura * 0.5} ${60 + grosor} ${SUELO_Y}
            Q ${60 + grosor + lerp(0.5, 4, g)} ${SUELO_Y + 1.5} ${60 + grosor + lerp(1, 4.5, g)} ${SUELO_Y + 3}
            L ${60 - grosor - lerp(1, 4.5, g)} ${SUELO_Y + 3}
            Q ${60 - grosor - lerp(0.5, 4, g)} ${SUELO_Y + 1.5} ${60 - grosor} ${SUELO_Y} Z`}
        fill={colorTallo}
      />
      {g > 0.18 && (
        <path d={`M 60 ${SUELO_Y} Q 59 ${SUELO_Y - altura * 0.6} 60 ${topeY + 2}`} fill="none"
          stroke={TRONCO_OSCURO} strokeWidth="1.1" opacity={clamp((g - 0.18) * 4, 0, 0.7)} />
      )}

      {/* ramas */}
      {cumulos.map((c, i) => {
        const rama = c[4]
        if (!rama) return null
        return (
          <path key={`r${i}`}
            d={`M ${rama.ancX} ${rama.ancY} Q ${(rama.ancX + rama.tipX) / 2} ${rama.ancY - rama.cr * 0.35} ${rama.tipX} ${rama.tipY}`}
            fill="none" stroke={colorTallo} strokeWidth={clamp(grosor * 0.42, 1, 3)} strokeLinecap="round" />
        )
      })}

      {/* hojas sueltas del tallo joven (una nueva cada ~3 días; ceden el sitio a la copa) */}
      {HOJAS_TALLO.map((h, i) => {
        if (d < 14 + i * 3) return null
        const op = clamp((0.34 - g) / 0.1, 0, 1)
        if (op <= 0) return null
        const y = SUELO_Y - altura * h.frac
        const x = 60 + h.lado * (grosor * 0.5 + 3.2)
        return (
          <ellipse key={`h${i}`} cx={x} cy={y} rx="4.6" ry="2" opacity={op}
            fill={i % 2 ? VERDE_VIVO : VERDE_TIERNO}
            transform={`rotate(${h.rot} ${x} ${y})`} />
        )
      })}

      {/* copa */}
      {cumulos.map(([cx, cy, r, color], i) => (
        <circle key={`c${i}`} cx={cx} cy={cy} r={r} fill={color} />
      ))}

      {/* brotecito en la punta mientras es joven */}
      {g < 0.12 && <circle cx="60" cy={topeY - 1} r="1.7" fill="#a7d68a" />}

      {/* oro del follaje (fundido desde el día ~340) */}
      {oroT > 0 && (
        <g opacity={oroT * 0.6}>
          <circle cx={copaX - copaR * 0.6} cy={copaY - copaR * 0.4} r={copaR * 0.32} fill={ORO} />
          <circle cx={copaX + copaR * 0.65} cy={copaY - copaR * 0.35} r={copaR * 0.28} fill={ORO} />
          <circle cx={copaX + copaR * 0.1} cy={copaY - copaR * 0.75} r={copaR * 0.26} fill={ORO_CLARO} />
        </g>
      )}

      {/* flores: una nueva cada ~8 días desde el 190 */}
      {FLORES.slice(0, nFlores).map(([fx, fy], i) => (
        <circle key={`f${i}`} cx={copaX + fx * copaR} cy={copaY + fy * copaR * 0.8}
          r="1.3" fill={ORO_CLARO} opacity="0.9" />
      ))}

      {/* frutos: uno nuevo cada ~12 días desde el 240 */}
      {FRUTOS.slice(0, nFrutos).map(([fx, fy], i) => (
        <g key={`fr${i}`}>
          <circle cx={copaX + fx * copaR} cy={copaY + fy * copaR * 0.85} r="2" fill={ORO} />
          <circle cx={copaX + fx * copaR - 0.6} cy={copaY + fy * copaR * 0.85 - 0.6} r="0.6" fill={ORO_CLARO} />
        </g>
      ))}

      {/* luciérnagas y estrellas del final del camino */}
      {LUCIERNAGAS.slice(0, nLuciernagas).map(([x, y, o], i) => (
        <circle key={`l${i}`} cx={x} cy={y} r="1.1" fill={ORO_CLARO} opacity={o * auraT} />
      ))}
      {d >= 450 && (
        <g>
          <Chispa x={44} y={35} r={2.6} opacidad={0.95} />
          <Chispa x={72} y={30} r={3.2} opacidad={0.95} />
          <Chispa x={58} y={25} r={2.2} opacidad={0.8} />
          <Chispa x={84} y={40} r={2} opacidad={0.7} />
        </g>
      )}
    </g>
  )
}

export default function Avatar({ dias = 0, tam = 120 }) {
  const d = Math.max(0, dias)
  const etapa = etapaArbol(d)
  const auraT = clamp((d - 365) / 40, 0, 1)
  const runas = d >= 300 ? 4 : d >= 240 ? 3 : d >= 150 ? 2 : d >= 85 ? 1 : 0
  const piedras = [
    { x: 21, y: 73, w: 8, h: 11 },
    { x: 33, y: 77, w: 6, h: 8 },
    { x: 81, y: 77, w: 6, h: 8 },
    { x: 91, y: 73, w: 8, h: 11 },
  ]

  return (
    <svg viewBox="0 0 120 120" width={tam} height={tam} role="img"
      aria-label={`Tu árbol: ${etapa.nombre} · día ${d}`}>
      <defs>
        <clipPath id="av-circulo">
          <circle cx="60" cy="60" r="56" />
        </clipPath>
        <radialGradient id="av-brillo" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor={ORO} stopOpacity={0.05 + auraT * 0.11} />
          <stop offset="100%" stopColor={ORO} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="60" r="56" fill="#141826" stroke="#2a3045" strokeWidth="2" />
      {auraT > 0 && (
        <circle cx="60" cy="60" r="52" fill="none" stroke={ORO} strokeWidth="1" opacity={auraT * 0.4} />
      )}
      {d >= 450 && (
        <circle cx="60" cy="60" r="48" fill="none" stroke={ORO_CLARO} strokeWidth="0.6" opacity="0.3" />
      )}

      <g clipPath="url(#av-circulo)">
        <circle cx="60" cy="60" r="56" fill="url(#av-brillo)" />
        <path d="M 0 83 Q 60 74 120 83 L 120 120 L 0 120 Z" fill="#1c1712" />
        <path d="M 0 83 Q 60 74 120 83" fill="none" stroke="#39301f" strokeWidth="1.6" />

        {piedras.map((p, i) => (
          <g key={i}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="2.4"
              fill="#232a3c" stroke="#333b52" strokeWidth="1" />
            <line x1={p.x + p.w / 2} y1={p.y + 2.4} x2={p.x + p.w / 2} y2={p.y + p.h - 2.4}
              stroke={i < runas ? ORO : '#3a4258'} strokeWidth="1.4" strokeLinecap="round" />
          </g>
        ))}

        {d < 14 ? <Subsuelo d={d} /> : <Arbol d={d} />}
      </g>
    </svg>
  )
}
