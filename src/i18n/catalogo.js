// Resolutores de contenido según idioma. El español (src/data) es el canon;
// el inglés vive en src/i18n/en/ y aquí se elige uno u otro con fallback al
// español si faltara una entrada (no debería: hay test guardián).

import { idioma } from './idioma.js'
import { EQUIPAMIENTO, GRUPOS } from '../data/ejercicios.js'
import { fichaDeEjercicio } from '../data/fichas-ejercicios.js'
import { AVISO_SUPLEMENTOS } from '../data/suplementos.js'
import { GUIA_NOVATO } from '../data/plantillas-rutinas.js'
import { EQUIPAMIENTO_EN, EQUIPOS_EN, GRUPOS_EN, NOMBRES_EN } from './en/ejercicios.en.js'
import { FICHAS_EN_A } from './en/fichas-a.en.js'
import { FICHAS_EN_B } from './en/fichas-b.en.js'
import { ETAPAS_EN, GUIA_NOVATO_EN, LOGROS_EN } from './en/logros-etapas.en.js'
import { ETAPAS_ARBOL_EN, MENSAJES_ESTACION_EN, MOMENTOS_EN } from './en/arbol.en.js'
import { PLANTILLAS_EN } from './en/plantillas.en.js'
import { AVISO_SUPLEMENTOS_EN, SUPLEMENTOS_EN } from './en/suplementos.en.js'

export const FICHAS_EN = { ...FICHAS_EN_A, ...FICHAS_EN_B }

const en = () => idioma() === 'en'

// --- ejercicios y taxonomías ---

export function nombreEjercicio(ej) {
  if (!ej) return ''
  if (en() && !ej.personalizado && NOMBRES_EN[ej.id]) return NOMBRES_EN[ej.id]
  return ej.nombre
}

export function nombreGrupo(grupoId) {
  const g = GRUPOS.find((x) => x.id === grupoId)
  const es = g ? g.nombre : grupoId
  return en() ? GRUPOS_EN[grupoId] || es : es
}

export function nombreEquipamiento(equipoId) {
  const e = EQUIPAMIENTO.find((x) => x.id === equipoId)
  const es = e ? e.nombre : equipoId
  return en() ? EQUIPAMIENTO_EN[equipoId] || es : es
}

// EQUIPOS de plantillas viene como pares [id, nombre]; aquí solo el nombre.
export function nombreEquipoPlantilla(equipoId, nombreEs) {
  return en() ? EQUIPOS_EN[equipoId] || nombreEs : nombreEs
}

export function fichaDe(id) {
  const es = fichaDeEjercicio(id)
  if (en()) return FICHAS_EN[id] || es
  return es
}

// --- logros y etapas del viaje ---

export function nombreLogro(logro) {
  const trad = en() && LOGROS_EN[logro.id]
  return trad ? trad.nombre : logro.nombre
}

export function descLogro(logro) {
  const trad = en() && LOGROS_EN[logro.id]
  return trad ? trad.descripcion : logro.descripcion
}

export function nombreEtapa(etapa) {
  const trad = en() && ETAPAS_EN[etapa.id]
  return trad ? trad.nombre : etapa.nombre
}

export function lemaEtapa(etapa) {
  const trad = en() && ETAPAS_EN[etapa.id]
  return trad ? trad.lema : etapa.lema
}

// --- árbol ---

export function nombreEtapaArbol(etapa) {
  const trad = en() && ETAPAS_ARBOL_EN[etapa.id]
  return trad ? trad.nombre : etapa.nombre
}

export function descEtapaArbol(etapa) {
  const trad = en() && ETAPAS_ARBOL_EN[etapa.id]
  return trad ? trad.descripcion : etapa.descripcion
}

export function momentoTexto(momento) {
  const trad = en() && MOMENTOS_EN[momento.dia]
  return trad ? { etiqueta: trad.etiqueta, mensaje: trad.mensaje } : { etiqueta: momento.etiqueta, mensaje: momento.mensaje }
}

export function mensajeEstacion(estacion, mensajesEs) {
  return en() ? MENSAJES_ESTACION_EN[estacion] || mensajesEs[estacion] : mensajesEs[estacion]
}

// --- plantillas ---

export function plantillaTexto(p) {
  const trad = en() && PLANTILLAS_EN[p.id]
  if (!trad) return { nombre: p.nombre, resumen: p.resumen, porQue: p.porQue, consejo: p.consejo }
  return { nombre: trad.nombre, resumen: trad.resumen, porQue: trad.porQue, consejo: trad.consejo }
}

export function nombreDiaPlantilla(p, indice) {
  const trad = en() && PLANTILLAS_EN[p.id]
  const nombreEs = p.dias[indice] ? p.dias[indice].nombre : ''
  return trad && trad.dias[indice] ? trad.dias[indice] : nombreEs
}

export function guiaNovato() {
  return en() ? GUIA_NOVATO_EN : GUIA_NOVATO
}

// --- suplementos ---

export function suplementoTexto(s) {
  const trad = en() && SUPLEMENTOS_EN[s.id]
  return trad ? { ...s, ...trad } : s
}

export function nombreSuplemento(s) {
  const trad = en() && SUPLEMENTOS_EN[s.id]
  return trad ? trad.nombre : s.nombre
}

export function avisoSuplementos() {
  return en() ? AVISO_SUPLEMENTOS_EN : AVISO_SUPLEMENTOS
}
