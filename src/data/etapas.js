// Etapas del viaje del héroe (CONTRACT.md §9).

export const ETAPAS = [
  {
    id: 'zero',
    nombre: 'Zero',
    nivelMin: 1,
    nivelMax: 1,
    lema: 'Todo héroe empieza en cero.',
  },
  {
    id: 'llamada',
    nombre: 'La Llamada',
    nivelMin: 2,
    nivelMax: 4,
    lema: 'Algo ha despertado. Ya no puedes ignorarlo.',
  },
  {
    id: 'umbral',
    nombre: 'El Umbral',
    nivelMin: 5,
    nivelMax: 8,
    lema: 'Has cruzado la puerta. Atrás queda el mundo ordinario.',
  },
  {
    id: 'pruebas',
    nombre: 'Las Pruebas',
    nivelMin: 9,
    nivelMax: 13,
    lema: 'Cada serie es una prueba. Cada día, un aliado.',
  },
  {
    id: 'caverna',
    nombre: 'La Caverna',
    nivelMin: 14,
    nivelMax: 18,
    lema: 'Aquí es donde se forjan los que vuelven.',
  },
  {
    id: 'renacido',
    nombre: 'Renacido',
    nivelMin: 19,
    nivelMax: 24,
    lema: 'El que entró no es el que sale.',
  },
  {
    id: 'hero',
    nombre: 'Hero',
    nivelMin: 25,
    nivelMax: 25,
    lema: 'Has vuelto con el elixir: la fuerza era el camino.',
  },
]

export function etapaDeNivel(nivel) {
  return (
    ETAPAS.find((e) => nivel >= e.nivelMin && nivel <= e.nivelMax) ||
    ETAPAS[ETAPAS.length - 1]
  )
}
