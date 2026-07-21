import { ETAPAS_ARBOL, etapaArbol } from '../data/arbol.js'

// El Árbol del Héroe: avatar procedural de 15 etapas que crece con los días
// de acción. Regla de oro: el árbol nunca se marchita ni encoge — crece o
// espera. Legible de 40px a 200px sobre fondo oscuro.

const VERDE_OSCURO = '#3f6b34'
const VERDE = '#4e8140'
const VERDE_CLARO = '#5d9a4c'
const VERDE_VIVO = '#6fb35a'
const TRONCO = '#7c5f3e'
const TRONCO_OSCURO = '#5f4830'
const ORO = '#d9a441'
const ORO_CLARO = '#f0c86e'
const SEMILLA = '#b8905a'
const RAIZ = '#d8cdb8'

// Copa por etapa (índice 7..15): círculos [cx, cy, r, color]
const COPAS = {
  7: [[60, 60, 7.5, VERDE], [54, 64, 6, VERDE_OSCURO], [66, 64, 6, VERDE_CLARO]],
  8: [[60, 55, 9, VERDE], [51, 61, 7, VERDE_OSCURO], [69, 61, 7, VERDE_CLARO], [60, 64, 7, VERDE]],
  9: [[60, 54, 9.5, VERDE], [50, 60, 7.5, VERDE_OSCURO], [70, 60, 7.5, VERDE_CLARO], [60, 63, 7.5, VERDE]],
  10: [[60, 50, 11, VERDE], [48, 57, 9, VERDE_OSCURO], [72, 57, 9, VERDE_CLARO], [54, 64, 8, VERDE], [66, 64, 8, VERDE_OSCURO]],
  11: [[60, 50, 11, VERDE], [48, 57, 9, VERDE_OSCURO], [72, 57, 9, VERDE_CLARO], [54, 64, 8, VERDE], [66, 64, 8, VERDE_OSCURO]],
  12: [[60, 48, 11.5, VERDE], [47, 55, 9.5, VERDE_OSCURO], [73, 55, 9.5, VERDE_CLARO], [53, 63, 8.5, VERDE], [67, 63, 8.5, VERDE_OSCURO]],
  13: [[60, 44, 12, VERDE], [45, 51, 10, VERDE_OSCURO], [75, 51, 10, VERDE_CLARO], [51, 60, 9, VERDE], [69, 60, 9, VERDE_OSCURO], [60, 56, 10, VERDE_CLARO]],
  14: [[60, 43, 12, VERDE], [45, 50, 10, VERDE_OSCURO], [75, 50, 10, VERDE_CLARO], [51, 59, 9, VERDE], [69, 59, 9, VERDE_OSCURO], [60, 55, 10, VERDE_VIVO]],
  15: [[60, 42, 12.5, VERDE], [44, 49, 10.5, VERDE_OSCURO], [76, 49, 10.5, VERDE_CLARO], [50, 58, 9.5, VERDE], [70, 58, 9.5, VERDE_OSCURO], [60, 54, 10.5, VERDE_VIVO]],
}

const ALTURA_TRONCO = { 7: 22, 8: 26, 9: 27, 10: 30, 11: 30, 12: 32, 13: 36, 14: 37, 15: 38 }
const ANCHO_TRONCO = { 7: 3.5, 8: 4, 9: 4.5, 10: 5.5, 11: 5.5, 12: 6, 13: 7, 14: 7, 15: 7.5 }

function Chispa({ x, y, r = 3, color = ORO_CLARO, opacidad = 1 }) {
  const p = `M ${x} ${y - r} L ${x + r * 0.35} ${y - r * 0.35} L ${x + r} ${y} L ${x + r * 0.35} ${y + r * 0.35} L ${x} ${y + r} L ${x - r * 0.35} ${y + r * 0.35} L ${x - r} ${y} L ${x - r * 0.35} ${y - r * 0.35} Z`
  return <path d={p} fill={color} opacity={opacidad} />
}

function Hoja({ x, y, rot, largo = 7, color = VERDE_CLARO }) {
  return (
    <ellipse cx={x} cy={y} rx={largo} ry={largo * 0.42} fill={color}
      transform={`rotate(${rot} ${x} ${y})`} />
  )
}

export default function Avatar({ dias = 0, tam = 120 }) {
  const etapa = etapaArbol(dias)
  const n = ETAPAS_ARBOL.findIndex((e) => e.id === etapa.id) + 1 // 1..15

  const runasEncendidas = n >= 13 ? 4 : n >= 12 ? 3 : n >= 10 ? 2 : n >= 8 ? 1 : 0
  const runas = [
    { x: 21, y: 73, w: 8, h: 11 },
    { x: 33, y: 77, w: 6, h: 8 },
    { x: 81, y: 77, w: 6, h: 8 },
    { x: 91, y: 73, w: 8, h: 11 },
  ]

  const alto = ALTURA_TRONCO[n] || 0
  const ancho = ANCHO_TRONCO[n] || 0
  const copa = COPAS[Math.min(n, 15)] || null

  return (
    <svg
      viewBox="0 0 120 120"
      width={tam}
      height={tam}
      role="img"
      aria-label={`Tu árbol: ${etapa.nombre}`}
    >
      <defs>
        <clipPath id="av-circulo">
          <circle cx="60" cy="60" r="56" />
        </clipPath>
        <radialGradient id="av-brillo" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor={ORO} stopOpacity={n >= 14 ? 0.16 : 0.05} />
          <stop offset="100%" stopColor={ORO} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="60" r="56" fill="#141826" stroke="#2a3045" strokeWidth="2" />
      {n >= 14 && (
        <circle cx="60" cy="60" r="52" fill="none" stroke={ORO} strokeWidth="1"
          opacity={n === 15 ? 0.5 : 0.3} />
      )}
      {n === 15 && (
        <circle cx="60" cy="60" r="48" fill="none" stroke={ORO_CLARO} strokeWidth="0.6" opacity="0.3" />
      )}

      <g clipPath="url(#av-circulo)">
        <circle cx="60" cy="60" r="56" fill="url(#av-brillo)" />

        {/* tierra */}
        <path d="M 0 83 Q 60 74 120 83 L 120 120 L 0 120 Z" fill="#1c1712" />
        <path d="M 0 83 Q 60 74 120 83" fill="none" stroke="#39301f" strokeWidth="1.6" />

        {/* piedras rúnicas */}
        {runas.map((p, i) => (
          <g key={i}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="2.4"
              fill="#232a3c" stroke="#333b52" strokeWidth="1" />
            <line
              x1={p.x + p.w / 2} y1={p.y + 2.4} x2={p.x + p.w / 2} y2={p.y + p.h - 2.4}
              stroke={i < runasEncendidas ? ORO : '#3a4258'}
              strokeWidth="1.4" strokeLinecap="round"
            />
          </g>
        ))}

        {/* ETAPA 1 — semilla */}
        {n === 1 && (
          <g>
            <path d="M 50 80 Q 60 75 70 80 Q 60 84 50 80 Z" fill="#242015" />
            <ellipse cx="60" cy="79" rx="4" ry="5.4" fill={SEMILLA} />
            <path d="M 60 73.6 Q 62.8 76 62.6 79" fill="none" stroke={ORO_CLARO} strokeWidth="1" opacity="0.8" />
            <Chispa x={60} y={64} r={2.6} opacidad={0.9} />
          </g>
        )}

        {/* ETAPA 2 — el despertar: la cáscara se agrieta, asoma la raíz */}
        {n === 2 && (
          <g>
            <path d="M 49 80 Q 60 74.5 71 80 Q 60 84.5 49 80 Z" fill="#242015" />
            <ellipse cx="60" cy="78.6" rx="4.2" ry="5.6" fill={SEMILLA} />
            <path d="M 58.4 74.4 L 60.2 77 L 58.9 79.6 L 60.6 82" fill="none" stroke="#4a3823" strokeWidth="1" />
            <path d="M 60 83.8 Q 59 88 60.6 92 Q 61.4 94.5 60.4 97" fill="none" stroke={RAIZ} strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
            <Chispa x={60} y={62.5} r={3} opacidad={0.95} />
          </g>
        )}

        {/* ETAPA 3 — germen bajo tierra, empujando hacia la superficie */}
        {n === 3 && (
          <g>
            <path d="M 47 80.5 Q 60 73.5 73 80.5 Q 60 86 47 80.5 Z" fill="#26221a" />
            <ellipse cx="61.5" cy="88" rx="3.4" ry="4.4" fill={SEMILLA} opacity="0.8" />
            <path d="M 61 91 Q 60 95 61 99" fill="none" stroke={RAIZ} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 61 85 Q 58 82 58.5 78.5 Q 58.8 76.8 60.6 76.2" fill="none" stroke="#8fbf74" strokeWidth="2" strokeLinecap="round" />
            <circle cx="60.8" cy="76.2" r="1.5" fill="#a7d68a" />
            <Chispa x={60} y={65} r={2.4} opacidad={0.75} />
          </g>
        )}

        {/* ETAPA 4 — brote: cruza la superficie */}
        {n === 4 && (
          <g>
            <path d="M 60 79 Q 60 73 60 70.5" fill="none" stroke={VERDE_CLARO} strokeWidth="2" strokeLinecap="round" />
            <Hoja x={55.5} y={70} rot={-32} largo={6.2} color={VERDE_VIVO} />
            <Hoja x={64.5} y={70} rot={32} largo={6.2} color={VERDE_CLARO} />
            <path d="M 56 80.4 Q 60 78.6 64 80.4" fill="none" stroke="#39301f" strokeWidth="1.2" />
          </g>
        )}

        {/* ETAPA 5 — plántula */}
        {n === 5 && (
          <g>
            <path d="M 60 79 Q 59.4 70 60 64.5" fill="none" stroke={VERDE_CLARO} strokeWidth="2.2" strokeLinecap="round" />
            <Hoja x={54.5} y={74} rot={-30} largo={6.5} color={VERDE} />
            <Hoja x={65.5} y={72.5} rot={30} largo={6.5} color={VERDE_CLARO} />
            <Hoja x={55} y={68} rot={-26} largo={6} color={VERDE_CLARO} />
            <Hoja x={65} y={66.5} rot={26} largo={6} color={VERDE_VIVO} />
            <circle cx="60" cy="63" r="1.8" fill="#a7d68a" />
          </g>
        )}

        {/* ETAPA 6 — tallo firme: lo tierno se vuelve madera */}
        {n === 6 && (
          <g>
            <path d="M 60 80 L 60 66" fill="none" stroke={TRONCO} strokeWidth="3" strokeLinecap="round" />
            <path d="M 60 70 Q 55 67 52.5 63.5" fill="none" stroke={TRONCO} strokeWidth="2" strokeLinecap="round" />
            <path d="M 60 66 Q 60 61 60 58.5" fill="none" stroke={VERDE_CLARO} strokeWidth="2.2" strokeLinecap="round" />
            <Hoja x={51} y={61.5} rot={-38} largo={5.8} color={VERDE_CLARO} />
            <Hoja x={56} y={57} rot={-20} largo={5.6} color={VERDE} />
            <Hoja x={64.5} y={56.5} rot={26} largo={6} color={VERDE_VIVO} />
            <circle cx="60" cy="55.8" r="1.7" fill="#a7d68a" />
          </g>
        )}

        {/* ETAPAS 7-15 — árbol con tronco y copa */}
        {n >= 7 && copa && (
          <g>
            {/* raíces visibles desde la etapa 9 (Raíces hondas): lo que no se ve */}
            {n >= 9 && (
              <g opacity={n === 9 ? 1 : 0.75}>
                <path d={`M ${60 - ancho} 80 Q ${52 - ancho} 84 ${46 - ancho} 90`} fill="none"
                  stroke={n >= 14 ? ORO : TRONCO_OSCURO} strokeWidth="2"
                  strokeLinecap="round" opacity={n >= 14 ? 0.5 : 0.9} />
                <path d={`M ${60 + ancho} 80 Q ${68 + ancho} 84 ${74 + ancho} 90`} fill="none"
                  stroke={n >= 14 ? ORO : TRONCO_OSCURO} strokeWidth="2"
                  strokeLinecap="round" opacity={n >= 14 ? 0.5 : 0.9} />
                <path d="M 60 82 Q 59 89 60 96" fill="none"
                  stroke={n >= 14 ? ORO : TRONCO_OSCURO} strokeWidth="1.6"
                  strokeLinecap="round" opacity={n >= 14 ? 0.45 : 0.8} />
              </g>
            )}
            {/* tronco con base ensanchada */}
            <path
              d={`M ${60 - ancho} 81 Q ${60 - ancho * 0.55} ${81 - alto * 0.5} ${60 - ancho * 0.45} ${81 - alto}
                  L ${60 + ancho * 0.45} ${81 - alto} Q ${60 + ancho * 0.55} ${81 - alto * 0.5} ${60 + ancho} 81
                  Q ${60 + ancho + 2.5} 82.5 ${60 + ancho + 4} 84 L ${60 - ancho - 4} 84
                  Q ${60 - ancho - 2.5} 82.5 ${60 - ancho} 81 Z`}
              fill={TRONCO}
            />
            <path d={`M 60 81 Q 59 ${81 - alto * 0.6} 60 ${81 - alto}`} fill="none"
              stroke={TRONCO_OSCURO} strokeWidth="1.2" opacity="0.7" />
            {/* rama lateral en árboles grandes */}
            {n >= 13 && (
              <path d={`M 60 ${81 - alto * 0.62} Q 72 ${79 - alto * 0.72} 79 ${77 - alto * 0.68}`}
                fill="none" stroke={TRONCO} strokeWidth="3" strokeLinecap="round" />
            )}
            {/* copa */}
            {copa.map(([cx, cy, r, color], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill={color} />
            ))}
            {/* toques dorados en el follaje (etapas 14-15) */}
            {n >= 14 && (
              <g>
                <circle cx="47" cy="46" r="4.5" fill={ORO} opacity="0.55" />
                <circle cx="74" cy="45" r="4" fill={ORO} opacity="0.5" />
                <circle cx="62" cy="38" r="3.5" fill={ORO_CLARO} opacity="0.55" />
              </g>
            )}
            {/* flores (etapa 11+) */}
            {n >= 11 && [
              [50, 50], [61, 44], [71, 51], [55, 58], [67, 59], [44, 56], [76, 57],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.3" fill={ORO_CLARO}
                opacity={n >= 12 ? 0.8 : 0.95} />
            ))}
            {/* frutos (etapa 12+) */}
            {n >= 12 && [[52, 63], [64, 65], [72, 60], [46, 58.5], [60, 60]].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="2" fill={ORO} />
                <circle cx={x - 0.6} cy={y - 0.6} r="0.6" fill={ORO_CLARO} />
              </g>
            ))}
            {/* luciérnagas (etapa 14+) */}
            {n >= 14 && [[34, 52, 0.9], [86, 47, 0.7], [40, 38, 0.8], [82, 66, 0.6]].map(([x, y, o], i) => (
              <circle key={i} cx={x} cy={y} r="1.1" fill={ORO_CLARO} opacity={o} />
            ))}
            {/* estrellas en la copa (etapa 15) */}
            {n === 15 && (
              <g>
                <Chispa x={44} y={35} r={2.6} opacidad={0.95} />
                <Chispa x={72} y={30} r={3.2} opacidad={0.95} />
                <Chispa x={58} y={25} r={2.2} opacidad={0.8} />
                <Chispa x={84} y={40} r={2} opacidad={0.7} />
              </g>
            )}
          </g>
        )}
      </g>
    </svg>
  )
}
