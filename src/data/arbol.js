// El Árbol del Héroe: el avatar crece con los DÍAS DE ACCIÓN (días distintos
// con sesión, pasos o peso registrado), no con el XP ni con el calendario.
// Máximo un día de árbol por día real: el ritmo es lento a propósito, y una
// mala racha nunca lo encoge — el árbol espera.

export const ETAPAS_ARBOL = [
  { id: 'semilla',   nombre: 'Semilla',          dias: 0,   descripcion: 'Todo está dentro.' },
  { id: 'despertar', nombre: 'El despertar',     dias: 3,   descripcion: 'La cáscara se agrieta.' },
  { id: 'germen',    nombre: 'Germen',           dias: 7,   descripcion: 'Empuja bajo tierra, donde nadie mira.' },
  { id: 'brote',     nombre: 'Brote',            dias: 14,  descripcion: 'Ha cruzado la superficie.' },
  { id: 'plantula',  nombre: 'Plántula',         dias: 25,  descripcion: 'Pequeña, pero mira al sol.' },
  { id: 'tallo',     nombre: 'Tallo firme',      dias: 40,  descripcion: 'Lo tierno se vuelve madera.' },
  { id: 'arbolillo', nombre: 'Arbolillo',        dias: 60,  descripcion: 'Ya tiene sombra propia.' },
  { id: 'joven',     nombre: 'Árbol joven',      dias: 85,  descripcion: 'El viento ya no lo asusta.' },
  { id: 'raices',    nombre: 'Raíces hondas',    dias: 115, descripcion: 'Lo importante pasa donde no se ve.' },
  { id: 'fuerte',    nombre: 'Árbol fuerte',     dias: 150, descripcion: 'Tronco ancho, palabra cumplida.' },
  { id: 'flor',      nombre: 'Primera flor',     dias: 190, descripcion: 'Florece lo que sembraste hace meses.' },
  { id: 'fruto',     nombre: 'Fruto',            dias: 240, descripcion: 'El esfuerzo ya alimenta.' },
  { id: 'venerable', nombre: 'Árbol venerable',  dias: 300, descripcion: 'Los que llegan descansan a su sombra.' },
  { id: 'heroe',     nombre: 'Árbol del Héroe',  dias: 365, descripcion: 'Un año de camino, dorado en las ramas.' },
  { id: 'leyenda',   nombre: 'Leyenda',          dias: 450, descripcion: 'Las estrellas anidan en su copa.' },
]

export function etapaArbol(diasDeAccion) {
  let etapa = ETAPAS_ARBOL[0]
  for (const e of ETAPAS_ARBOL) {
    if (diasDeAccion >= e.dias) etapa = e
    else break
  }
  return etapa
}

// La siguiente etapa, o null si ya es la última.
export function siguienteEtapaArbol(diasDeAccion) {
  return ETAPAS_ARBOL.find((e) => e.dias > diasDeAccion) || null
}
