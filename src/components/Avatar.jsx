import { useId } from 'react'

// Avatar procedural (CONTRACT.md §16): SVG 0 0 120 120, 7 etapas del viaje del
// héroe claramente distintas y crecientes en épica. Legible a 40px y a 200px.

const PIEL = '#d7a57e'

const FONDOS = {
  zero:     { centro: '#1f2330', borde: '#10131b', anillo: '#272d3f' },
  llamada:  { centro: '#252b3d', borde: '#131724', anillo: '#39415a' },
  umbral:   { centro: '#2a3149', borde: '#151a29', anillo: '#4a527a' },
  pruebas:  { centro: '#322e26', borde: '#171511', anillo: '#6b5a3a' },
  caverna:  { centro: '#3a2f26', borde: '#181310', anillo: '#7c5f3a' },
  renacido: { centro: '#363a52', borde: '#171926', anillo: '#8a90b8' },
  hero:     { centro: '#4d3d1c', borde: '#1d160a', anillo: '#d9a441' },
}

function Sombra({ rx = 21 }) {
  return <ellipse cx="60" cy="105" rx={rx} ry="4" fill="#000" opacity="0.3" />
}

// Zero: silueta gris encorvada, sin rostro, apagada. El punto de partida.
function FiguraZero() {
  const gris = '#5a616f'
  const grisOscuro = '#484e5b'
  return (
    <g>
      <Sombra rx={18} />
      <path d="M53 80 Q52 92 51 102" stroke={grisOscuro} strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M65 80 Q66 92 67 102" stroke={grisOscuro} strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M49 62 Q45 75 46 87" stroke={grisOscuro} strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M67 60 Q71 74 69 87" stroke={grisOscuro} strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M46 84 Q43 60 57 50 Q69 43 72 55 L74 84 Q60 92 46 84 Z" fill={gris} />
      <circle cx="64" cy="42" r="11" fill={gris} />
    </g>
  )
}

// La Llamada: la figura despierta (piel en el rostro), erguida, chispa dorada.
function FiguraLlamada() {
  const cuerpo = '#7d8699'
  const oscuro = '#646d81'
  return (
    <g>
      <Sombra />
      <path d="M54 80 L52 103" stroke={oscuro} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M66 80 L68 103" stroke={oscuro} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M45 53 Q39 64 38 76" stroke={cuerpo} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M75 53 Q81 64 82 76" stroke={cuerpo} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M44 50 Q60 43 76 50 L73 83 Q60 89 47 83 Z" fill={cuerpo} />
      <circle cx="60" cy="32" r="12" fill={PIEL} />
      <circle cx="86" cy="25" r="9" fill="#f0c86e" opacity="0.22" />
      <path d="M86 15 L88.4 22.6 L96 25 L88.4 27.4 L86 35 L83.6 27.4 L76 25 L83.6 22.6 Z" fill="#f0c86e" />
    </g>
  )
}

// El Umbral: túnica sencilla de aprendiz con bordes dorados tenues.
function FiguraUmbral() {
  const tunica = '#3d4663'
  return (
    <g>
      <Sombra />
      <circle cx="53" cy="101" r="4" fill="#242a3d" />
      <circle cx="67" cy="101" r="4" fill="#242a3d" />
      <path d="M45 53 Q39 64 38 76" stroke={tunica} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M75 53 Q81 64 82 76" stroke={tunica} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M45 50 Q60 43 75 50 L79 98 Q60 105 41 98 Z" fill={tunica} stroke="#d9a441" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M41 98 Q60 105 79 98" stroke="#d9a441" strokeWidth="2.5" fill="none" opacity="0.85" />
      <path d="M47 72 L73 72" stroke="#262c40" strokeWidth="5" strokeLinecap="round" />
      <rect x="57" y="68.5" width="6" height="7" rx="1.5" fill="#d9a441" />
      <circle cx="60" cy="32" r="12" fill={PIEL} />
    </g>
  )
}

// Las Pruebas: peto de cuero con correas cruzadas, vendas en las muñecas.
function FiguraPruebas() {
  const pantalon = '#4e5563'
  const cuero = '#7c4b2a'
  const correa = '#4d2d16'
  const venda = '#cfc9bd'
  return (
    <g>
      <Sombra />
      <path d="M54 80 L52 103" stroke={pantalon} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M66 80 L68 103" stroke={pantalon} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M45 53 Q39 64 38 76" stroke={PIEL} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M75 53 Q81 64 82 76" stroke={PIEL} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M34.5 69 L42 71" stroke={venda} strokeWidth="3" strokeLinecap="round" />
      <path d="M34 73.5 L41.5 75" stroke={venda} strokeWidth="3" strokeLinecap="round" />
      <path d="M78 71 L85.5 69" stroke={venda} strokeWidth="3" strokeLinecap="round" />
      <path d="M78.5 75 L86 73.5" stroke={venda} strokeWidth="3" strokeLinecap="round" />
      <path d="M44 50 Q60 43 76 50 L73 83 Q60 89 47 83 Z" fill={cuero} />
      <path d="M48 52 L70 80" stroke={correa} strokeWidth="4" />
      <path d="M72 52 L50 80" stroke={correa} strokeWidth="4" />
      <path d="M47 81 L73 81" stroke={correa} strokeWidth="5" />
      <circle cx="60" cy="81" r="3" fill="#d9a441" />
      <circle cx="60" cy="32" r="12" fill={PIEL} />
      <path d="M49 29 Q60 24.5 71 29" stroke="#a2452f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </g>
  )
}

// La Caverna: armadura parcial y antorcha en alto que ilumina la oscuridad.
function FiguraCaverna() {
  const pantalon = '#454d5e'
  const acero = '#98a2b8'
  const aceroOscuro = '#6d7688'
  return (
    <g>
      <circle cx="86" cy="19" r="13" fill="#fb923c" opacity="0.18" />
      <Sombra />
      <path d="M54 80 L52 103" stroke={pantalon} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M66 80 L68 103" stroke={pantalon} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M45 53 Q39 64 38 76" stroke={acero} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M75 52 L86 38" stroke={acero} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M86 40 L86 24" stroke="#6b4a2a" strokeWidth="4" strokeLinecap="round" />
      <path d="M86 10 Q91.5 16.5 86 23 Q80.5 16.5 86 10 Z" fill="#fb923c" />
      <circle cx="86" cy="17" r="2.6" fill="#fde68a" />
      <path d="M44 50 Q60 43 76 50 L73 83 Q60 89 47 83 Z" fill="#6e4526" />
      <path d="M44 50 Q60 43 76 50 L74.5 67 Q60 72 45.5 67 Z" fill={acero} stroke={aceroOscuro} strokeWidth="1" />
      <circle cx="45" cy="51" r="7" fill="#7c8699" stroke={aceroOscuro} strokeWidth="1.5" />
      <circle cx="60" cy="32" r="12" fill={PIEL} />
    </g>
  )
}

// Renacido: armadura completa de acero, capa carmesí y el primer destello dorado.
function FiguraRenacido() {
  const acero = '#aeb8cc'
  const aceroMedio = '#8b95aa'
  const aceroOscuro = '#667089'
  return (
    <g>
      <Sombra rx={24} />
      <path d="M45 51 Q37 78 41 102 Q60 109 79 102 Q83 78 75 51 Z" fill="#7f2231" />
      <path d="M54 80 L52 103" stroke={aceroMedio} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M66 80 L68 103" stroke={aceroMedio} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M45 53 Q39 64 38 76" stroke={aceroMedio} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M75 53 Q81 64 82 76" stroke={aceroMedio} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M44 50 Q60 43 76 50 L73 83 Q60 89 47 83 Z" fill={acero} />
      <path d="M60 46 L60 87" stroke={aceroOscuro} strokeWidth="2" />
      <path d="M60 58 L64.5 63.5 L60 69 L55.5 63.5 Z" fill="#d9a441" />
      <circle cx="44" cy="50" r="7.5" fill={aceroMedio} stroke={aceroOscuro} strokeWidth="1.5" />
      <circle cx="76" cy="50" r="7.5" fill={aceroMedio} stroke={aceroOscuro} strokeWidth="1.5" />
      <circle cx="60" cy="32" r="12" fill={PIEL} />
      <path d="M47.5 31 Q47.5 18.5 60 18.5 Q72.5 18.5 72.5 31 Q60 25.5 47.5 31 Z" fill={acero} stroke={aceroOscuro} strokeWidth="1" />
    </g>
  )
}

// Hero: armadura dorada, capa, yelmo con penacho y aura radiante. El retorno.
function FiguraHero({ idAura, idOro }) {
  const oroSolido = '#e3b654'
  const oroBorde = '#f7dfa0'
  const oroOscuro = '#b8842c'
  return (
    <g>
      <circle cx="60" cy="56" r="46" fill={`url(#${idAura})`} />
      <g stroke="#f0c86e" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <path d="M60 13 L60 4" />
        <path d="M28 26 L22 20" />
        <path d="M92 26 L98 20" />
        <path d="M26 58 L17 58" />
        <path d="M94 58 L103 58" />
      </g>
      <Sombra rx={25} />
      <path d="M45 51 Q37 78 41 102 Q60 109 79 102 Q83 78 75 51 Z" fill="#9c2333" />
      <path d="M41 102 Q60 109 79 102" stroke="#d9a441" strokeWidth="2" fill="none" />
      <path d="M55 82 L48 103" stroke={oroOscuro} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M65 82 L72 103" stroke={oroOscuro} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M45 53 Q36 63 34.5 74" stroke={oroSolido} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M75 53 Q84 63 85.5 74" stroke={oroSolido} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M44 50 Q60 43 76 50 L73 84 Q60 90 47 84 Z" fill={`url(#${idOro})`} stroke={oroBorde} strokeWidth="1.2" />
      <path d="M60 55 L66 63 L60 71 L54 63 Z" fill="#fff3d6" />
      <circle cx="44" cy="50" r="8" fill={oroSolido} stroke={oroBorde} strokeWidth="1.5" />
      <circle cx="76" cy="50" r="8" fill={oroSolido} stroke={oroBorde} strokeWidth="1.5" />
      <circle cx="60" cy="32" r="12" fill={PIEL} />
      <path d="M52 18 Q60 6 68 18 Q60 13 52 18 Z" fill="#b3202e" />
      <path d="M47.5 31 Q47.5 18.5 60 18.5 Q72.5 18.5 72.5 31 Q60 25.5 47.5 31 Z" fill={oroSolido} stroke={oroBorde} strokeWidth="1.2" />
    </g>
  )
}

const FIGURAS = {
  zero: FiguraZero,
  llamada: FiguraLlamada,
  umbral: FiguraUmbral,
  pruebas: FiguraPruebas,
  caverna: FiguraCaverna,
  renacido: FiguraRenacido,
  hero: FiguraHero,
}

export default function Avatar({ etapaId = 'zero', tam = 120 }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const etapa = FIGURAS[etapaId] ? etapaId : 'zero'
  const fondo = FONDOS[etapa]
  const Figura = FIGURAS[etapa]
  const idFondo = `av-fondo-${uid}`
  const idAura = `av-aura-${uid}`
  const idOro = `av-oro-${uid}`
  return (
    <svg
      viewBox="0 0 120 120"
      width={tam}
      height={tam}
      className="avatar"
      role="img"
      aria-label={`Avatar de la etapa ${etapa}`}
    >
      <defs>
        <radialGradient id={idFondo} cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor={fondo.centro} />
          <stop offset="100%" stopColor={fondo.borde} />
        </radialGradient>
        <radialGradient id={idAura} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0c86e" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#f0c86e" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#f0c86e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={idOro} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0c86e" />
          <stop offset="100%" stopColor="#b8842c" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="57" fill={`url(#${idFondo})`} stroke={fondo.anillo} strokeWidth="2.5" />
      {etapa === 'hero' ? <FiguraHero idAura={idAura} idOro={idOro} /> : <Figura />}
    </svg>
  )
}
