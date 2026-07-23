import { etapaArbol } from '../data/arbol.js'

// AVATAR EN BARBECHO: el arte del árbol se ha retirado (tres propuestas
// rechazadas) y está pendiente de elegir dirección visual con una página de
// estilos comparados. Mientras tanto: un marcador neutro y digno — la chispa
// del camino, que brilla más cuantos más días de acción lleva.
// La MECÁNICA se conserva intacta: días de acción, 15 etapas con nombre y el
// catálogo de 43 momentos (MOMENTOS_ARBOL) que usará el arte definitivo.

const ORO = '#d9a441'
const ORO_CLARO = '#f0c86e'

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

export default function Avatar({ dias = 0, tam = 120 }) {
  const d = Math.max(0, dias)
  const etapa = etapaArbol(d)
  const t = Math.min(1, d / 450)
  const r = 5 + t * 7
  const p = (x, y, rr) =>
    `M ${x} ${y - rr} L ${x + rr * 0.32} ${y - rr * 0.32} L ${x + rr} ${y} L ${x + rr * 0.32} ${y + rr * 0.32} ` +
    `L ${x} ${y + rr} L ${x - rr * 0.32} ${y + rr * 0.32} L ${x - rr} ${y} L ${x - rr * 0.32} ${y - rr * 0.32} Z`

  return (
    <svg viewBox="0 0 120 120" width={tam} height={tam} role="img"
      aria-label={`Tu camino: ${etapa.nombre} · día ${d}`}>
      <defs>
        <radialGradient id="av-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ORO} stopOpacity={0.22 + t * 0.2} />
          <stop offset="70%" stopColor={ORO} stopOpacity="0.04" />
          <stop offset="100%" stopColor={ORO} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="#141826" stroke="#2a3045" strokeWidth="2" />
      <path d="M 22 84 Q 60 78 98 84" fill="none" stroke="#39301f" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="60" cy="58" r="34" fill="url(#av-halo)" />
      <path d={p(60, 58, r)} fill={ORO_CLARO} />
      <path d={p(60, 58, r * 0.45)} fill="#fff4d6" />
      <circle cx="60" cy="58" r={16 + t * 14} fill="none" stroke={ORO} strokeWidth="0.8" opacity={0.25 + t * 0.3} />
    </svg>
  )
}
