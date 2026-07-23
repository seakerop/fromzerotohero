import { etapaArbol } from '../data/arbol.js'

// El Árbol del Héroe — estilo "orgánico silueta" (dirección C, elegida por el
// usuario en dist/estilos-arbol.html): cielo de atardecer, siluetas suaves con
// luz arriba-izquierda y sombra al vientre, tronco cálido, oro en la madurez.
// La copa se construye por LÓBULOS que se funden en una sola silueta: cada
// capa (sombra, cuerpo, luz, brillo) pinta todos los lóbulos del mismo color,
// así el conjunto lee como una nube única y no como bolas apiladas.
// 43 momentos señalables (MOMENTOS_ARBOL) + tamaño continuo por debajo.
// Regla de oro intacta: nunca se marchita, crece o espera.

const V_OSC = '#31572b'
const V_MED = '#457a39'
const V_CLA = '#5f9c4b'
const V_BRI = '#7fbd66'
const TRONCO = '#6d5334'
const ORO = '#d9a441'
const ORO_CLARO = '#f0c86e'
const SEMILLA = '#b8905a'
const RAIZ = '#d8cdb8'
const LUCERO = '#e8e2cf'

const SUELO_Y = 82

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1)
const madura = (d, dia0, dur) => clamp((d - dia0) / dur, 0, 1)

function mezcla(hexA, hexB, t) {
  const a = [1, 3, 5].map((i) => parseInt(hexA.slice(i, i + 2), 16))
  const b = [1, 3, 5].map((i) => parseInt(hexB.slice(i, i + 2), 16))
  return `#${a.map((x, i) => Math.round(lerp(x, b[i], t)).toString(16).padStart(2, '0')).join('')}`
}

export const MOMENTOS_ARBOL = [
  { dia: 0, etiqueta: 'La semilla' },
  { dia: 2, etiqueta: 'La grieta' },
  { dia: 4, etiqueta: 'La primera raíz' },
  { dia: 6, etiqueta: 'La segunda raíz' },
  { dia: 8, etiqueta: 'El germen' },
  { dia: 11, etiqueta: 'A un dedo de la luz' },
  { dia: 14, etiqueta: 'El brote' },
  { dia: 17, etiqueta: 'La tercera hoja' },
  { dia: 20, etiqueta: 'La cuarta hoja' },
  { dia: 24, etiqueta: 'La quinta hoja' },
  { dia: 28, etiqueta: 'El penacho' },
  { dia: 33, etiqueta: 'La base se endurece' },
  { dia: 38, etiqueta: 'La primera rama' },
  { dia: 44, etiqueta: 'Hojas en la rama' },
  { dia: 50, etiqueta: 'La segunda rama' },
  { dia: 57, etiqueta: 'Más follaje' },
  { dia: 64, etiqueta: 'Ya es tronco' },
  { dia: 72, etiqueta: 'La tercera rama' },
  { dia: 80, etiqueta: 'La copa se une' },
  { dia: 85, etiqueta: 'El primer lucero' },
  { dia: 92, etiqueta: 'Una seta al pie' },
  { dia: 100, etiqueta: 'Musgo en el tronco' },
  { dia: 115, etiqueta: 'Raíces a la vista' },
  { dia: 125, etiqueta: 'La cuarta rama' },
  { dia: 135, etiqueta: 'Un nido' },
  { dia: 150, etiqueta: 'El segundo lucero' },
  { dia: 165, etiqueta: 'Llega un pájaro' },
  { dia: 180, etiqueta: 'Hierba alta' },
  { dia: 190, etiqueta: 'El primer capullo' },
  { dia: 198, etiqueta: 'La flor se abre' },
  { dia: 200, etiqueta: 'La quinta rama' },
  { dia: 210, etiqueta: 'Tres flores' },
  { dia: 225, etiqueta: 'Floración' },
  { dia: 240, etiqueta: 'El primer fruto' },
  { dia: 255, etiqueta: 'Más frutos' },
  { dia: 270, etiqueta: 'La cosecha' },
  { dia: 285, etiqueta: 'Una luciérnaga' },
  { dia: 300, etiqueta: 'El tercer lucero' },
  { dia: 320, etiqueta: 'La rama colgante' },
  { dia: 340, etiqueta: 'El primer oro' },
  { dia: 365, etiqueta: 'Árbol del Héroe' },
  { dia: 425, etiqueta: 'Noche de luciérnagas' },
  { dia: 450, etiqueta: 'Leyenda' },
]

export function proximoMomento(dias) {
  return MOMENTOS_ARBOL.find((m) => m.dia > dias) || null
}

// Ramas: nacen en días concretos, se extienden en ~60 días y sostienen un
// lóbulo de copa. frac = altura del anclaje; lado = izquierda/derecha.
const RAMAS = [
  { dia: 38, lado: -1, frac: 0.86, maxLen: 13 },
  { dia: 50, lado: 1, frac: 0.74, maxLen: 14 },
  { dia: 72, lado: -1, frac: 0.58, maxLen: 15 },
  { dia: 125, lado: 1, frac: 0.44, maxLen: 16 },
  { dia: 200, lado: -1, frac: 0.32, maxLen: 14 },
]

const HOJAS_TALLO = [
  { dia: 14, frac: 0.66, lado: -1, rot: -32 },
  { dia: 14, frac: 0.78, lado: 1, rot: 30 },
  { dia: 17, frac: 0.52, lado: 1, rot: 26 },
  { dia: 20, frac: 0.88, lado: -1, rot: -26 },
  { dia: 24, frac: 0.42, lado: -1, rot: -22 },
]

// Posiciones normalizadas dentro de la copa (x, y en radios de copa).
const FLORES = [
  { dia: 198, p: [0.1, -0.75] },
  { dia: 210, p: [-0.7, -0.25] },
  { dia: 210, p: [0.66, -0.2] },
  { dia: 225, p: [-0.4, 0.35] },
  { dia: 225, p: [0.42, 0.42] },
  { dia: 225, p: [-0.92, 0.2] },
  { dia: 225, p: [0.9, 0.22] },
]
const FRUTOS = [
  { dia: 240, p: [-0.5, 0.5] },
  { dia: 255, p: [0.32, 0.62] },
  { dia: 255, p: [0.8, 0.18] },
  { dia: 270, p: [-0.85, 0.14] },
  { dia: 270, p: [0.05, 0.28] },
]
const LUCEROS = [
  { dia: 85, x: 38, y: 26 },
  { dia: 150, x: 82, y: 21 },
  { dia: 300, x: 25, y: 42 },
]
const LUCIERNAGAS = [
  { dia: 285, x: 38, y: 56, o: 0.9 },
  { dia: 425, x: 86, y: 48, o: 0.7 },
  { dia: 425, x: 44, y: 40, o: 0.75 },
  { dia: 425, x: 80, y: 66, o: 0.6 },
]

function Estrella({ x, y, r, opacidad = 1 }) {
  const p = `M ${x} ${y - r} L ${x + r * 0.3} ${y - r * 0.3} L ${x + r} ${y} L ${x + r * 0.3} ${y + r * 0.3} L ${x} ${y + r} L ${x - r * 0.3} ${y + r * 0.3} L ${x - r} ${y} L ${x - r * 0.3} ${y - r * 0.3} Z`
  return <path d={p} fill={ORO_CLARO} opacity={opacidad} />
}

// Días 0-13: la semilla sobre el montículo, la grieta, las raíces, el germen.
function Subsuelo({ d }) {
  const raiz1 = madura(d, 4, 4)
  const raiz2 = madura(d, 6, 4)
  const germen = d >= 8
  const tipY = lerp(78, 70.5, madura(d, 8, 6))
  return (
    <g>
      <path d="M 50 81.5 Q 60 76.5 70 81.5 Q 60 84.5 50 81.5 Z" fill="#242015" />
      <path d="M 56.5 80 C 56 74.5 58.5 71 60 71 C 61.5 71 64 74.5 63.5 80 C 63 82.5 57 82.5 56.5 80 Z"
        fill={SEMILLA} />
      <path d="M 58.2 73.5 Q 60 75.5 60.3 78.5" fill="none" stroke={ORO_CLARO} strokeWidth="1.1" opacity="0.9" />
      {d >= 2 && (
        <path d="M 59.7 72.3 L 60.5 74.8 L 59.9 77.4" fill="none" stroke="#4a3823" strokeWidth="0.9" />
      )}
      {raiz1 > 0 && (
        <path d={`M 60 82 q -1 ${raiz1 * 4} 0.6 ${raiz1 * 8}`} fill="none"
          stroke={RAIZ} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      )}
      {raiz2 > 0 && (
        <path d={`M 58.6 81.5 q -3 ${raiz2 * 3} -4.4 ${raiz2 * 5.5}`} fill="none"
          stroke={RAIZ} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      )}
      {germen && (
        <g>
          <path d={`M 63 79.5 C 65.5 ${tipY + 5} 64.5 ${tipY + 2} 63.2 ${tipY + 0.5}`}
            fill="none" stroke={V_BRI} strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="63" cy={tipY} rx="1.9" ry="1.1" fill={V_BRI}
            transform={`rotate(-30 63 ${tipY})`} />
        </g>
      )}
      <circle cx="60" cy="58" r="13" fill={ORO} opacity="0.08" />
      <path d="M 60 53 l 1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1 Z" fill={ORO_CLARO} />
    </g>
  )
}

// Días 14+: el árbol. Silueta por capas: sombra interior, cuerpo, luz, brillo.
function Arbol({ d }) {
  const g = clamp(Math.pow((d - 14) / 350, 0.6), 0, 1)
  const altura = lerp(9, 44, g)
  const topeY = SUELO_Y - altura
  const w = lerp(1.1, 3.4, Math.pow(g, 0.95)) // media anchura del tronco
  const lign = madura(d, 33, 30)
  const colorTronco = mezcla(V_CLA, TRONCO, lign)
  const oroT = madura(d, 340, 50)
  const auraT = madura(d, 365, 35)
  const raicesT = madura(d, 115, 30)

  // --- lóbulos de la copa ---
  const lobulos = []
  if (d >= 28) lobulos.push([60, topeY + 2, lerp(2.5, 12, madura(d, 28, 240))])
  const ramas = []
  RAMAS.forEach((r) => {
    if (d < r.dia) return
    const len = lerp(2.5, r.maxLen, madura(d, r.dia, 60))
    const ancY = SUELO_Y - altura * r.frac
    const ancX = 60 + r.lado * w * 0.5
    const tipX = ancX + r.lado * len * 0.8
    const tipY = ancY - len * 0.6
    ramas.push({ ancX, ancY, tipX, tipY, len })
    if (d >= r.dia + 6) {
      lobulos.push([tipX, tipY - 1, lerp(1.8, 7.5 + 4 * (1 - r.frac), madura(d, r.dia + 6, 70))])
    }
  })
  if (d >= 80) {
    const rl = lerp(2, 9.5, madura(d, 80, 120))
    lobulos.push([60 - (7 + 7 * g), topeY + 6, rl])
    lobulos.push([60 + (7 + 7 * g), topeY + 5, rl * 0.94])
  }

  const copaX = 60
  const copaY = topeY + 4
  const copaR = lerp(5, 24, g)
  const hayCopa = lobulos.length > 0

  const capa = (color, dx, dy, esc, opacidad = 1, minR = 0) =>
    lobulos
      .filter(([, , r]) => r > minR)
      .map(([x, y, r], i) => (
        <circle key={i} cx={x + dx * r} cy={y + dy * r} r={r * esc} fill={color} opacity={opacidad} />
      ))

  return (
    <g>
      {/* luceros del cielo (días 85, 150, 300) */}
      {LUCEROS.map((l, i) => {
        if (d < l.dia) return null
        const op = madura(d, l.dia, 12)
        return (
          <g key={`lc${i}`}>
            <circle cx={l.x} cy={l.y} r="0.9" fill={LUCERO} opacity={op * 0.9} />
            <circle cx={l.x} cy={l.y} r="2.6" fill={LUCERO} opacity={op * 0.12} />
          </g>
        )
      })}

      {/* raíces a la vista (día 115) */}
      {raicesT > 0 && (
        <g opacity={raicesT}>
          <path d={`M ${60 - w} ${SUELO_Y - 1} Q ${54 - w} 84 ${50 - w} 88`} fill="none"
            stroke={mezcla('#5a452c', ORO, oroT * 0.6)} strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${60 + w} ${SUELO_Y - 1} Q ${66 + w} 84 ${70 + w} 88`} fill="none"
            stroke={mezcla('#5a452c', ORO, oroT * 0.6)} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* hierba alta (día 180) */}
      {d >= 180 && [[34, 0], [87, 1], [46, 2], [76, 3]].map(([x, i]) => (
        <g key={`hi${i}`} opacity={madura(d, 180, 20) * 0.9}>
          <path d={`M ${x} ${SUELO_Y + 2} q -1.4 -3.6 -2.6 -4.8`} fill="none" stroke={V_OSC} strokeWidth="1" strokeLinecap="round" />
          <path d={`M ${x} ${SUELO_Y + 2} q 0.2 -4.4 -0.2 -5.8`} fill="none" stroke={V_MED} strokeWidth="1" strokeLinecap="round" />
          <path d={`M ${x} ${SUELO_Y + 2} q 1.6 -3.4 2.8 -4.4`} fill="none" stroke={V_OSC} strokeWidth="1" strokeLinecap="round" />
        </g>
      ))}

      {/* tronco: brizna verde → tronco cálido con pies acampanados */}
      <path
        d={`M ${60 - w} ${SUELO_Y}
            C ${60 - w * 0.9} ${SUELO_Y - altura * 0.4} ${60 - w * 0.55} ${SUELO_Y - altura * 0.7} ${60 - w * 0.4} ${topeY + (hayCopa ? 6 : 0)}
            L ${60 + w * 0.4} ${topeY + (hayCopa ? 6 : 0)}
            C ${60 + w * 0.55} ${SUELO_Y - altura * 0.66} ${60 + w * 0.9} ${SUELO_Y - altura * 0.36} ${60 + w} ${SUELO_Y}
            C ${60 + w + 1.6} ${SUELO_Y + 1.2} ${60 + w + 2.6} ${SUELO_Y + 2} ${60 + w + 3.2} ${SUELO_Y + 3}
            L ${60 - w - 3.2} ${SUELO_Y + 3}
            C ${60 - w - 2.6} ${SUELO_Y + 2} ${60 - w - 1.6} ${SUELO_Y + 1.2} ${60 - w} ${SUELO_Y} Z`}
        fill={colorTronco}
      />

      {/* musgo (día 100) */}
      {d >= 100 && (
        <g opacity={madura(d, 100, 20)}>
          <circle cx={60 - w * 0.9} cy={SUELO_Y - 1.5} r="1.4" fill={V_OSC} />
          <circle cx={60 - w * 0.2} cy={SUELO_Y + 0.2} r="1" fill={V_MED} />
          <circle cx={60 + w * 0.75} cy={SUELO_Y - 0.6} r="1.1" fill={V_OSC} />
        </g>
      )}

      {/* ramas */}
      {ramas.map((r, i) => (
        <path key={`r${i}`}
          d={`M ${r.ancX} ${r.ancY} Q ${(r.ancX + r.tipX) / 2} ${r.ancY - r.len * 0.4} ${r.tipX} ${r.tipY}`}
          fill="none" stroke={colorTronco} strokeWidth={clamp(w * 0.8, 1, 2.6)} strokeLinecap="round" />
      ))}

      {/* rama colgante (día 320) */}
      {d >= 320 && (
        <g opacity={madura(d, 320, 25)}>
          <path d={`M ${60 + w * 0.3} ${topeY + 5} Q 75 ${topeY + 3} 81 ${topeY + 12}`}
            fill="none" stroke={colorTronco} strokeWidth="2" strokeLinecap="round" />
          <circle cx="82" cy={topeY + 14} r="4.4" fill={V_MED} />
          <circle cx="80.8" cy={topeY + 12.6} r="2.6" fill={V_CLA} />
        </g>
      )}

      {/* hojas sueltas del tallo joven */}
      {HOJAS_TALLO.map((h, i) => {
        if (d < h.dia) return null
        const op = clamp((70 - d) / 18, 0, 1)
        if (op <= 0) return null
        const y = SUELO_Y - altura * h.frac
        const x = 60 + h.lado * (w * 0.6 + 2.8)
        return (
          <ellipse key={`h${i}`} cx={x} cy={y} rx="4.2" ry="1.9" opacity={op}
            fill={i % 2 ? V_BRI : V_CLA} transform={`rotate(${h.rot} ${x} ${y})`} />
        )
      })}

      {/* copa en cuatro capas que se funden en una silueta */}
      {hayCopa && (
        <g>
          {capa(V_MED, 0, 0, 1)}
          {capa(V_OSC, 0.16, 0.24, 0.82, 0.9, 2.5)}
          {capa(V_MED, -0.06, -0.1, 0.9)}
          {capa(V_CLA, -0.2, -0.28, 0.68, 1, 2.5)}
          {capa(V_BRI, -0.3, -0.4, 0.34, 1, 4)}
          {oroT > 0 && capa(ORO, 0, -0.06, 0.95, oroT * 0.55)}
          {oroT > 0 && capa(ORO_CLARO, -0.22, -0.3, 0.6, oroT * 0.5, 3)}
        </g>
      )}
      {!hayCopa && <ellipse cx="60" cy={topeY - 1} rx="2" ry="1.2" fill={V_BRI} />}

      {/* seta al pie (día 92) */}
      {d >= 92 && (
        <g opacity={madura(d, 92, 15)}>
          <path d="M 44.2 81.5 C 44 79.5 44.4 78.4 45.1 78.4 C 45.8 78.4 46.2 79.5 46 81.5 Z" fill="#e8dcc0" />
          <path d="M 41.8 78.6 Q 45.1 73.8 48.4 78.6 Q 45.1 80 41.8 78.6 Z" fill="#a35a3f" />
          <circle cx="44.2" cy="76.9" r="0.5" fill="#e8dcc0" />
          <circle cx="46.3" cy="77.3" r="0.4" fill="#e8dcc0" />
        </g>
      )}

      {/* nido (135) y pájaro (165) en la primera rama */}
      {d >= 135 && ramas[0] && (
        <g opacity={madura(d, 135, 15)}>
          <ellipse cx={ramas[0].tipX + 2.4} cy={ramas[0].tipY + 2} rx="3" ry="1.6" fill="#6b4f2e" />
          <ellipse cx={ramas[0].tipX + 2.4} cy={ramas[0].tipY + 1.4} rx="2.1" ry="0.9" fill="#4a3823" />
          {d >= 165 && (
            <g opacity={madura(d, 165, 12)}>
              <circle cx={ramas[0].tipX + 2.2} cy={ramas[0].tipY - 0.6} r="1.5" fill="#7a8aa8" />
              <circle cx={ramas[0].tipX + 3.5} cy={ramas[0].tipY - 1.4} r="1" fill="#8e9cb8" />
              <path d={`M ${ramas[0].tipX + 4.4} ${ramas[0].tipY - 1.5} l 1.5 0.5 l -1.5 0.5 Z`} fill={ORO} />
            </g>
          )}
        </g>
      )}

      {/* capullo (190) y flores una a una */}
      {d >= 190 && d < 198 && (
        <ellipse cx={copaX + 0.1 * copaR} cy={copaY - 0.75 * copaR * 0.8} rx="1.1" ry="1.6"
          fill={mezcla(V_BRI, ORO_CLARO, madura(d, 190, 8))} />
      )}
      {FLORES.map((f, i) => {
        if (d < f.dia) return null
        const x = copaX + f.p[0] * copaR
        const y = copaY + f.p[1] * copaR * 0.8
        return (
          <g key={`fl${i}`} opacity={madura(d, f.dia, 6)}>
            <circle cx={x} cy={y} r="1.4" fill={ORO_CLARO} />
            <circle cx={x} cy={y} r="0.5" fill="#fff4d6" />
          </g>
        )
      })}

      {/* frutos uno a uno, con su brillo */}
      {FRUTOS.map((f, i) => {
        if (d < f.dia) return null
        const x = copaX + f.p[0] * copaR
        const y = copaY + f.p[1] * copaR * 0.85
        return (
          <g key={`fr${i}`} opacity={madura(d, f.dia, 8)}>
            <circle cx={x} cy={y} r="2.3" fill={ORO} />
            <circle cx={x - 0.7} cy={y - 0.7} r="0.75" fill={ORO_CLARO} />
          </g>
        )
      })}

      {/* luciérnagas */}
      {LUCIERNAGAS.map((l, i) => {
        if (d < l.dia) return null
        return <circle key={`lu${i}`} cx={l.x} cy={l.y} r="1.1" fill={ORO_CLARO}
          opacity={l.o * madura(d, l.dia, 15)} />
      })}

      {/* aura y estrellas del final */}
      {auraT > 0 && (
        <circle cx="60" cy="56" r="49" fill="none" stroke={ORO} strokeWidth="1" opacity={auraT * 0.4} />
      )}
      {d >= 450 && (
        <g>
          <circle cx="60" cy="56" r="44" fill="none" stroke={ORO_CLARO} strokeWidth="0.6" opacity="0.3" />
          <Estrella x={44} y={24} r={2.4} opacidad={0.95} />
          <Estrella x={76} y={18} r={2.9} opacidad={0.95} />
          <Estrella x={59} y={14} r={2} opacidad={0.8} />
        </g>
      )}
    </g>
  )
}

export default function Avatar({ dias = 0, tam = 120 }) {
  const d = Math.max(0, dias)
  const etapa = etapaArbol(d)
  return (
    <svg viewBox="0 0 120 120" width={tam} height={tam} role="img"
      aria-label={`Tu árbol: ${etapa.nombre} · día ${d}`}>
      <defs>
        <radialGradient id="av-cielo" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#1b2233" />
          <stop offset="100%" stopColor="#10141f" />
        </radialGradient>
        <clipPath id="av-rec">
          <circle cx="60" cy="60" r="56" />
        </clipPath>
      </defs>
      <circle cx="60" cy="60" r="56" fill="#141826" stroke="#2a3045" strokeWidth="2" />
      <g clipPath="url(#av-rec)">
        <circle cx="60" cy="60" r="56" fill="url(#av-cielo)" />
        <ellipse cx="60" cy="86" rx="42" ry="9" fill="#1c1712" />
        <path d="M 18 84 Q 60 76 102 84" fill="none" stroke="#39301f" strokeWidth="1.6" />
        {d < 14 ? <Subsuelo d={d} /> : <Arbol d={d} />}
      </g>
    </svg>
  )
}
