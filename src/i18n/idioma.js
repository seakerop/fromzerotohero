// Idioma de la app (es/en). El español es el canon: el código, los datos y
// los tests viven en español; el inglés se re-crea con el mismo tono en
// src/i18n/en/. t(es, en) se evalúa en cada render y, como el idioma vive en
// estado.ajustes.idioma, cambiarlo re-renderiza el árbol entero — sin claves,
// sin archivos de mensajes, sin huecos posibles.

let idiomaActual = 'es'

export function establecerIdioma(idioma) {
  idiomaActual = idioma === 'en' ? 'en' : 'es'
}

export function idioma() {
  return idiomaActual
}

export function t(es, en) {
  return idiomaActual === 'en' ? en : es
}

// Locale para números (toLocaleString): coma decimal en es, punto en en.
export function localeNum() {
  return idiomaActual === 'en' ? 'en-US' : 'es-ES'
}

// Para personajes nuevos: el idioma del navegador decide el punto de partida.
export function idiomaInicial() {
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'es'
  return nav.toLowerCase().startsWith('en') ? 'en' : 'es'
}
