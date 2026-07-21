// Días de acción y etapa del Árbol del Héroe. Un día cuenta una sola vez,
// haya lo que haya registrado ese día (sesión, pasos o peso). Las medidas y
// fotos son semanales y no mueven el árbol.

export { ETAPAS_ARBOL, etapaArbol, siguienteEtapaArbol } from '../data/arbol.js'

export function diasDeAccion(estado) {
  const dias = new Set()
  for (const s of estado.sesiones) dias.add(s.fecha)
  for (const p of estado.pasos) dias.add(p.fecha)
  for (const p of estado.cuerpo.pesos) dias.add(p.fecha)
  return dias.size
}
