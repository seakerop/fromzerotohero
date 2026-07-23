import { etapaArbol } from '../data/arbol.js'

// El Árbol del Héroe, tercera iteración: un DIORAMA que se puebla momento a
// momento. La clave no es que el árbol "se haga grande", sino que cada pocos
// días de acción aparece algo nuevo y señalable: una grieta, una hoja, una
// rama, una seta, un nido, un pájaro, una flor… 43 momentos en 450 días,
// con el tamaño interpolando suave por debajo. Nunca se marchita ni retrocede.

const VERDE_OSCURO = '#39622f'
const VERDE = '#4e8140'
const VERDE_CLARO = '#61a04f'
const VERDE_VIVO = '#79bd63'
const VERDE_BRILLO = '#95d47c'
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
// Progreso 0→1 desde que algo aparece (dia0) hasta que madura (en `dur` días).
const madura = (d, dia0, dur) => clamp((d - dia0) / dur, 0, 1)

// Catálogo de momentos: qué aparece y cuándo. La galería lo usa para etiquetar.
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
  { dia: 85, etiqueta: 'Primera runa' },
  { dia: 92, etiqueta: 'Una seta al pie' },
  { dia: 100, etiqueta: 'Musgo en el tronco' },
  { dia: 115, etiqueta: 'Raíces a la vista' },
  { dia: 125, etiqueta: 'La cuarta rama' },
  { dia: 135, etiqueta: 'Un nido' },
  { dia: 150, etiqueta: 'Segunda runa' },
  { dia: 165, etiqueta: 'Llega un pájaro' },
  { dia: 180, etiqueta: 'Hierba alta' },
  { dia: 190, etiqueta: 'El primer capullo' },
  { dia: 198, etiqueta: 'La flor se abre' },
  { dia: 200, etiqueta: 'La quinta rama' },
  { dia: 210, etiqueta: 'Tres flores' },
  { dia: 225, etiqueta: 'Floración' },
  { dia: 240, etiqueta: 'Tercera runa · primer fruto' },
  { dia: 255, etiqueta: 'Más frutos' },
  { dia: 270, etiqueta: 'La cosecha' },
  { dia: 285, etiqueta: 'Una luciérnaga' },
  { dia: 300, etiqueta: 'Cuarta runa' },
  { dia: 320, etiqueta: 'La rama colgante' },
  { dia: 340, etiqueta: 'El primer oro' },
  { dia: 365, etiqueta: 'Árbol del Héroe' },
  { dia: 425, etiqueta: 'Noche de luciérnagas' },
  { dia: 450, etiqueta: 'Leyenda' },
]

export function proximoMomento(dias) {
  return MOMENTOS_ARBOL.find((m) => m.dia > dias) || null
}

// Ramas: nacen en días concretos y tardan ~60 días en extenderse del todo.
const RAMAS = [
  { dia: 38, lado: -1, frac: 0.88, maxLen: 15 },
  { dia: 50, lado: 1, frac: 0.76, maxLen: 16 },
  { dia: 72, lado: -1, frac: 0.6, maxLen: 17 },
  { dia: 125, lado: 1, frac: 0.46, maxLen: 18 },
  { dia: 200, lado: -1, frac: 0.34, maxLen: 16 },
]

// Hojas del tallo joven: van saliendo una a una y ceden el sitio a la copa.
const HOJAS_TALLO = [
  { dia: 14, frac: 0.68, lado: -1, rot: -34 },
  { dia: 14, frac: 0.78, lado: 1, rot: 32 },
  { dia: 17, frac: 0.55, lado: 1, rot: 28 },
  { dia: 20, frac: 0.88, lado: -1, rot: -28 },
  { dia: 24, frac: 0.44, lado: -1, rot: -24 },
]

// Flores y frutos: posiciones normalizadas dentro de la copa, entran por orden.
const FLORES = [
  { dia: 198, p: [0.15, -0.85] },
  { dia: 210, p: [-0.75, -0.2] },
  { dia: 210, p: [0.7, -0.1] },
  { dia: 225, p: [-0.35, 0.45] },
  { dia: 225, p: [0.45, 0.5] },
  { dia: 225, p: [-0.95, 0.25] },
  { dia: 225, p: [0.95, 0.3] },
]
const FRUTOS = [
  { dia: 240, p: [-0.55, 0.6] },
  { dia: 255, p: [0.3, 0.75] },
  { dia: 255, p: [0.85, 0.35] },
  { dia: 270, p: [-0.9, 0.3] },
  { dia: 270, p: [0.6, -0.3] },
]
const LUCIERNAGAS = [
  { dia: 285, x: 36, y: 50, o: 0.9 },
  { dia: 425, x: 86, y: 47, o: 0.7 },
  { dia: 425, x: 40, y: 36, o: 0.8 },
  { dia: 425, x: 82, y: 66, o: 0.6 },
]

function Chispa({ x, y, r = 3, color = ORO_CLARO, opacidad = 1 }) {
  const p = `M ${x} ${y - r} L ${x + r * 0.35} ${y - r * 0.35} L ${x + r} ${y} L ${x + r * 0.35} ${y + r * 0.35} L ${x} ${y + r} L ${x - r * 0.35} ${y + r * 0.35} L ${x - r} ${y} L ${x - r * 0.35} ${y - r * 0.35} Z`
  return <path d={p} fill={color} opacity={opacidad} />
}

// Penacho de follaje con volumen: sombra, cuerpo y dos luces.
function Penacho({ x, y, r }) {
  if (r <= 0.4) return null
  return (
    <g>
      <circle cx={x + r * 0.16} cy={y + r * 0.2} r={r} fill={VERDE_OSCURO} />
      <circle cx={x - r * 0.06} cy={y - r * 0.08} r={r * 0.9} fill={VERDE} />
      <circle cx={x - r * 0.28} cy={y - r * 0.3} r={r * 0.55} fill={VERDE_CLARO} />
      <circle cx={x - r * 0.42} cy={y - r * 0.44} r={r * 0.26} fill={VERDE_BRILLO} />
    </g>
  )
}

function Subsuelo({ d }) {
  const grieta = d >= 2
  const raiz1 = madura(d, 4, 4)
  const raiz2 = madura(d, 6, 4)
  const germen = d >= 8
  const germenY = lerp(85, 78.2, madura(d, 8, 6)) // día 11: a un dedo de la luz
  return (
    <g>
      <path d="M 49 80 Q 60 74.5 71 80 Q 60 84.5 49 80 Z" fill="#242015" />
      <ellipse cx="60" cy={germen ? 87 : 78.8} rx={germen ? 3.4 : 4.2} ry={germen ? 4.4 : 5.6}
        fill={SEMILLA} opacity={germen ? 0.8 : 1} />
      {grieta && !germen && (
        <path d="M 58.4 74.4 L 60.2 77 L 58.9 79.6 L 60.6 82" fill="none"
          stroke="#4a3823" strokeWidth="1" />
      )}
      {raiz1 > 0 && (
        <path d={`M 60 ${germen ? 90.5 : 84} q -1 ${raiz1 * 4} 0.6 ${raiz1 * 9}`}
          fill="none" stroke={RAIZ} strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      )}
      {raiz2 > 0 && (
        <path d={`M 59 ${germen ? 89 : 83} q -3 ${raiz2 * 3} -4.5 ${raiz2 * 6.5}`}
          fill="none" stroke={RAIZ} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
      )}
      {germen && (
        <g>
          <path d={`M 60.5 85 Q 57.5 ${germenY + 3.5} 58.2 ${germenY + 1} Q 58.6 ${germenY} 60 ${germenY}`}
            fill="none" stroke={VERDE_TIERNO} strokeWidth="2" strokeLinecap="round" />
          <circle cx="60.2" cy={germenY} r="1.5" fill="#a7d68a" />
        </g>
      )}
      <Chispa x={60} y={germen ? 64.5 : 63.5} r={lerp(2.4, 3, d / 13)} opacidad={0.9} />
    </g>
  )
}

function Arbol({ d }) {
  // Altura y grosor: crecen suave del día 14 al 365; después solo cambia la luz.
  const g = clamp(Math.pow((d - 14) / 350, 0.6), 0, 1)
  const altura = lerp(6, 46, g)
  const topeY = SUELO_Y - altura
  const grosor = lerp(1.3, 7, Math.pow(g, 0.95))
  const lign = madura(d, 33, 30) // la base se endurece del día 33 al 63 ("ya es tronco")
  const colorTallo = mezcla(VERDE_CLARO, TRONCO, lign)

  const oroT = madura(d, 340, 50)
  const auraT = madura(d, 365, 35)
  const raicesT = madura(d, 115, 30)

  // Penachos de la copa
  const penachos = []
  const rPenachoTope = d >= 28 ? lerp(2.2, 12.5, madura(d, 28, 200)) : 0
  if (rPenachoTope > 0) penachos.push([60, topeY + 1, rPenachoTope])
  const puntas = []
  RAMAS.forEach((r) => {
    if (d < r.dia) return
    const ext = madura(d, r.dia, 60)
    const len = lerp(3, r.maxLen, ext)
    const ancX = 60 + r.lado * grosor * 0.4
    const ancY = SUELO_Y - altura * r.frac
    const tipX = ancX + r.lado * len * 0.85
    const tipY = ancY - len * 0.5
    puntas.push({ ancX, ancY, tipX, tipY, len, grosorRama: clamp(grosor * 0.42, 1, 2.8) })
    if (d >= r.dia + 6) {
      penachos.push([tipX, tipY, lerp(1.8, 7 + 5 * (1 - r.frac), madura(d, r.dia + 6, 70))])
    }
  })
  if (d >= 80) {
    const rl = lerp(2, 10, madura(d, 80, 120))
    penachos.push([60 - (8 + 6 * g), topeY + 7, rl])
    penachos.push([60 + (8 + 6 * g), topeY + 6, rl * 0.92])
  }

  const copaX = 60
  const copaY = topeY + 5
  const copaR = lerp(6, 21, g)
  const colorRaiz = mezcla(TRONCO_OSCURO, ORO, oroT * 0.7)

  return (
    <g>
      {/* raíces a la vista (día 115, homenaje a las semanas malas) */}
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

      {/* hierba alta (día 180): la vida rodea al árbol */}
      {d >= 180 && [[31, 0], [88, 1], [46, 2], [76, 3]].map(([x, i]) => (
        <g key={`hi${i}`} opacity={madura(d, 180, 20)}>
          <path d={`M ${x} ${SUELO_Y + 1} q -1.2 -3.4 -2.4 -4.6`} fill="none" stroke={VERDE_OSCURO} strokeWidth="1" strokeLinecap="round" />
          <path d={`M ${x} ${SUELO_Y + 1} q 0.2 -4 0 -5.4`} fill="none" stroke={VERDE} strokeWidth="1" strokeLinecap="round" />
          <path d={`M ${x} ${SUELO_Y + 1} q 1.4 -3.2 2.6 -4.2`} fill="none" stroke={VERDE_OSCURO} strokeWidth="1" strokeLinecap="round" />
        </g>
      ))}

      {/* tronco: brizna → tronco con curva orgánica y base acampanada */}
      <path
        d={`M ${60 - grosor} ${SUELO_Y}
            C ${60 - grosor * 0.85} ${SUELO_Y - altura * 0.35} ${60 - grosor * 0.5} ${SUELO_Y - altura * 0.62} ${60 - grosor * 0.35} ${topeY}
            L ${60 + grosor * 0.35} ${topeY}
            C ${60 + grosor * 0.5} ${SUELO_Y - altura * 0.58} ${60 + grosor * 0.85} ${SUELO_Y - altura * 0.32} ${60 + grosor} ${SUELO_Y}
            Q ${60 + grosor + lerp(0.5, 3.6, g)} ${SUELO_Y + 1.5} ${60 + grosor + lerp(1, 4.2, g)} ${SUELO_Y + 3}
            L ${60 - grosor - lerp(1, 4.2, g)} ${SUELO_Y + 3}
            Q ${60 - grosor - lerp(0.5, 3.6, g)} ${SUELO_Y + 1.5} ${60 - grosor} ${SUELO_Y} Z`}
        fill={colorTallo}
      />
      {lign > 0.6 && (
        <path d={`M ${60 - grosor * 0.25} ${SUELO_Y - 1} Q ${60 - grosor * 0.5} ${SUELO_Y - altura * 0.55} ${60 - grosor * 0.1} ${topeY + 3}`}
          fill="none" stroke={TRONCO_OSCURO} strokeWidth="1" opacity={(lign - 0.6) * 1.6} />
      )}

      {/* musgo en el tronco (día 100) */}
      {d >= 100 && (
        <g opacity={madura(d, 100, 20)}>
          <circle cx={60 - grosor * 0.9} cy={SUELO_Y - 2.5} r="1.5" fill={VERDE_OSCURO} />
          <circle cx={60 - grosor * 0.4} cy={SUELO_Y - 0.8} r="1.1" fill={VERDE} />
          <circle cx={60 + grosor * 0.7} cy={SUELO_Y - 1.6} r="1.2" fill={VERDE_OSCURO} />
        </g>
      )}

      {/* ramas */}
      {puntas.map((r, i) => (
        <path key={`r${i}`}
          d={`M ${r.ancX} ${r.ancY} Q ${(r.ancX + r.tipX) / 2} ${r.ancY - r.len * 0.35} ${r.tipX} ${r.tipY}`}
          fill="none" stroke={colorTallo} strokeWidth={r.grosorRama} strokeLinecap="round" />
      ))}

      {/* rama colgante (día 320): madurez que se inclina */}
      {d >= 320 && (
        <g opacity={madura(d, 320, 25)}>
          <path d={`M ${60 + grosor * 0.3} ${topeY + 3} Q ${74} ${topeY + 2} ${80} ${topeY + 10}`}
            fill="none" stroke={colorTallo} strokeWidth="2.2" strokeLinecap="round" />
          <Penacho x={81} y={topeY + 12} r={4.5} />
        </g>
      )}

      {/* hojas sueltas del tallo joven */}
      {HOJAS_TALLO.map((h, i) => {
        if (d < h.dia) return null
        const op = clamp((70 - d) / 18, 0, 1)
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
      {penachos.map(([x, y, r], i) => (
        <Penacho key={`p${i}`} x={x} y={y} r={r} />
      ))}
      {g < 0.12 && <circle cx="60" cy={topeY - 1} r="1.7" fill="#a7d68a" />}

      {/* seta al pie (día 92) */}
      {d >= 92 && (
        <g opacity={madura(d, 92, 15)}>
          <rect x="43.2" y="77.6" width="1.8" height="3.2" rx="0.8" fill="#e8dcc0" />
          <path d="M 41.2 78 Q 44.1 73.6 47 78 Z" fill="#a35a3f" />
          <circle cx="43.2" cy="76.6" r="0.45" fill="#e8dcc0" />
          <circle cx="45.2" cy="76.9" r="0.35" fill="#e8dcc0" />
        </g>
      )}

      {/* nido (día 135) y pájaro (día 165) en la primera rama */}
      {d >= 135 && puntas[0] && (
        <g opacity={madura(d, 135, 15)}>
          <ellipse cx={puntas[0].tipX + 2} cy={puntas[0].tipY + 1.6} rx="3" ry="1.6" fill="#6b4f2e" />
          <ellipse cx={puntas[0].tipX + 2} cy={puntas[0].tipY + 1} rx="2.1" ry="0.9" fill="#4a3823" />
          {d >= 165 && (
            <g opacity={madura(d, 165, 12)}>
              <circle cx={puntas[0].tipX + 2} cy={puntas[0].tipY - 0.8} r="1.5" fill="#7a8aa8" />
              <circle cx={puntas[0].tipX + 3.3} cy={puntas[0].tipY - 1.6} r="1" fill="#8e9cb8" />
              <path d={`M ${puntas[0].tipX + 4.2} ${puntas[0].tipY - 1.7} l 1.4 0.45 l -1.4 0.45 Z`} fill={ORO} />
            </g>
          )}
        </g>
      )}

      {/* oro del follaje (día 340 en adelante) */}
      {oroT > 0 && (
        <g opacity={oroT * 0.6}>
          <circle cx={copaX - copaR * 0.6} cy={copaY - copaR * 0.4} r={copaR * 0.32} fill={ORO} />
          <circle cx={copaX + copaR * 0.65} cy={copaY - copaR * 0.35} r={copaR * 0.28} fill={ORO} />
          <circle cx={copaX + copaR * 0.1} cy={copaY - copaR * 0.75} r={copaR * 0.26} fill={ORO_CLARO} />
        </g>
      )}

      {/* capullo (día 190) y flores una a una */}
      {d >= 190 && d < 198 && (
        <ellipse cx={copaX + 0.15 * copaR} cy={copaY - 0.85 * copaR * 0.8} rx="1.1" ry="1.5"
          fill={mezcla(VERDE_BRILLO, ORO_CLARO, madura(d, 190, 8))} />
      )}
      {FLORES.map((f, i) => {
        if (d < f.dia) return null
        return (
          <g key={`fl${i}`} opacity={madura(d, f.dia, 6)}>
            <circle cx={copaX + f.p[0] * copaR} cy={copaY + f.p[1] * copaR * 0.8} r="1.4" fill={ORO_CLARO} />
            <circle cx={copaX + f.p[0] * copaR} cy={copaY + f.p[1] * copaR * 0.8} r="0.5" fill="#fff2cf" />
          </g>
        )
      })}

      {/* frutos uno a uno */}
      {FRUTOS.map((f, i) => {
        if (d < f.dia) return null
        const x = copaX + f.p[0] * copaR
        const y = copaY + f.p[1] * copaR * 0.85
        return (
          <g key={`fr${i}`} opacity={madura(d, f.dia, 8)}>
            <circle cx={x} cy={y} r="2" fill={ORO} />
            <circle cx={x - 0.6} cy={y - 0.6} r="0.6" fill={ORO_CLARO} />
          </g>
        )
      })}

      {/* luciérnagas */}
      {LUCIERNAGAS.map((l, i) => {
        if (d < l.dia) return null
        return <circle key={`lu${i}`} cx={l.x} cy={l.y} r="1.1" fill={ORO_CLARO}
          opacity={l.o * madura(d, l.dia, 15)} />
      })}

      {/* estrellas de la Leyenda (día 450) */}
      {d >= 450 && (
        <g>
          <Chispa x={44} y={33} r={2.6} opacidad={0.95} />
          <Chispa x={72} y={28} r={3.2} opacidad={0.95} />
          <Chispa x={58} y={23} r={2.2} opacidad={0.8} />
          <Chispa x={84} y={38} r={2} opacidad={0.7} />
        </g>
      )}
    </g>
  )
}

function mezcla(hexA, hexB, t) {
  const a = [1, 3, 5].map((i) => parseInt(hexA.slice(i, i + 2), 16))
  const b = [1, 3, 5].map((i) => parseInt(hexB.slice(i, i + 2), 16))
  return `#${a.map((x, i) => Math.round(lerp(x, b[i], t)).toString(16).padStart(2, '0')).join('')}`
}

export default function Avatar({ dias = 0, tam = 120 }) {
  const d = Math.max(0, dias)
  const etapa = etapaArbol(d)
  const auraT = madura(d, 365, 35)
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
