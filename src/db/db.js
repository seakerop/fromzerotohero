// Persistencia local — IndexedDB `fzth` v1, sin librerías (CONTRACT.md §6).
// La conexión se abre una sola vez y se reutiliza en todo el módulo db.

const NOMBRE_BD = 'fzth'
const VERSION_BD = 1
const STORE_ESTADO = 'estado'
const STORE_FOTOS = 'fotos'
const CLAVE_ESTADO = 'v1'

let promesaBD = null
// Durante el borrado total no se admite ni una escritura más: sin esto, el
// volcado de guardado al ocultarse la página podía RESUCITAR la base recién
// borrada (el fallo de «Borrar todos los datos» en iOS).
let borrando = false

// Abre (o reutiliza) la conexión con la BD. Si el navegador la cierra por su
// cuenta, la siguiente operación vuelve a abrirla.
export function abrirBD() {
  if (promesaBD) return promesaBD
  promesaBD = new Promise((resolver, rechazar) => {
    const peticion = indexedDB.open(NOMBRE_BD, VERSION_BD)
    peticion.onupgradeneeded = () => {
      const bd = peticion.result
      if (!bd.objectStoreNames.contains(STORE_ESTADO)) {
        bd.createObjectStore(STORE_ESTADO)
      }
      if (!bd.objectStoreNames.contains(STORE_FOTOS)) {
        bd.createObjectStore(STORE_FOTOS, { keyPath: 'id' })
      }
    }
    peticion.onsuccess = () => {
      const bd = peticion.result
      bd.onclose = () => { promesaBD = null }
      // Si alguien pide borrar/actualizar la BD, soltamos la conexión: una
      // conexión abierta bloquea deleteDatabase indefinidamente.
      bd.onversionchange = () => {
        bd.close()
        promesaBD = null
      }
      resolver(bd)
    }
    peticion.onerror = () => {
      promesaBD = null
      rechazar(peticion.error || new Error('No se pudo abrir la base de datos local'))
    }
  })
  return promesaBD
}

// Ejecuta `operar(store)` en una transacción y resuelve con el resultado de la
// petición devuelta. Helper interno del módulo db (lo usa también fotos.js).
export async function enTransaccion(nombreStore, modo, operar) {
  const bd = await abrirBD()
  return new Promise((resolver, rechazar) => {
    const transaccion = bd.transaction(nombreStore, modo)
    const peticion = operar(transaccion.objectStore(nombreStore))
    transaccion.oncomplete = () => resolver(peticion ? peticion.result : undefined)
    transaccion.onabort = () => rechazar(transaccion.error || new Error('Operación cancelada en la base de datos'))
    transaccion.onerror = () => rechazar(transaccion.error || new Error('Error al acceder a la base de datos'))
  })
}

// Carga el estado guardado (o null si aún no hay nada) aplicando migrar().
export async function cargarEstado() {
  const bruto = await enTransaccion(STORE_ESTADO, 'readonly', (store) => store.get(CLAVE_ESTADO))
  return bruto == null ? null : migrar(bruto)
}

// Guarda el estado de inmediato bajo la clave fija 'v1' (App debouncea).
export async function guardarEstado(estado) {
  if (borrando) return
  await enTransaccion(STORE_ESTADO, 'readwrite', (store) => store.put(estado, CLAVE_ESTADO))
}

// Borrado total DETERMINISTA: cierra nuestra conexión (que bloquearía el
// deleteDatabase), espera a que el borrado termine de verdad y deja el módulo
// inerte hasta la recarga. Nada de carreras con el reload.
export async function borrarBaseDeDatos() {
  borrando = true
  try {
    if (promesaBD) {
      const bd = await promesaBD.catch(() => null)
      if (bd) bd.close()
    }
  } finally {
    promesaBD = null
  }
  await new Promise((resolver) => {
    const peticion = indexedDB.deleteDatabase(NOMBRE_BD)
    peticion.onsuccess = resolver
    peticion.onerror = resolver // recargamos igual; mejor esfuerzo
    // onblocked no corta: nuestra conexión ya está cerrada y cualquier otra
    // pestaña la soltará por su onversionchange.
  })
}

/* ---- migrar: normaliza cualquier objeto al modelo completo de §4 ---- */

const OBJETIVOS = ['perder', 'fuerza', 'ambos']
const EXPERIENCIAS = ['ninguna', 'algo', 'habitual']

function esObjeto(valor) {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

function lista(valor) {
  return Array.isArray(valor) ? valor : []
}

function numero(valor, defecto) {
  return Number.isFinite(valor) ? valor : defecto
}

function numeroONulo(valor) {
  return Number.isFinite(valor) ? valor : null
}

function migrarPerfil(bruto) {
  // Sin perfil no hay personaje: App muestra el onboarding.
  if (!esObjeto(bruto)) return null
  return {
    ...bruto,
    apodo: typeof bruto.apodo === 'string' ? bruto.apodo : '',
    edad: numeroONulo(bruto.edad),
    alturaCm: numeroONulo(bruto.alturaCm),
    objetivo: OBJETIVOS.includes(bruto.objetivo) ? bruto.objetivo : 'ambos',
    experiencia: EXPERIENCIAS.includes(bruto.experiencia) ? bruto.experiencia : 'ninguna',
    creadoEl: typeof bruto.creadoEl === 'string' ? bruto.creadoEl : null,
  }
}

function migrarBaseline(bruto) {
  const b = esObjeto(bruto) ? bruto : {}
  return {
    ...b,
    pasosDia: numero(b.pasosDia, 4000),
    diasEjercicioSemana: numero(b.diasEjercicioSemana, 0),
    pesoInicialKg: numeroONulo(b.pesoInicialKg),
    historial: lista(b.historial),
    ultimaRecalibracion: typeof b.ultimaRecalibracion === 'string' ? b.ultimaRecalibracion : null,
  }
}

function migrarAjustes(bruto) {
  const b = esObjeto(bruto) ? bruto : {}
  return {
    ...b,
    diasPlanificados: lista(b.diasPlanificados),
    descansoSeg: numero(b.descansoSeg, 90),
  }
}

function migrarContadores(bruto) {
  const b = esObjeto(bruto) ? bruto : {}
  return {
    ...b,
    sesionesTotales: numero(b.sesionesTotales, 0),
    prsTotales: numero(b.prsTotales, 0),
    diasPasosSobreBaseline: numero(b.diasPasosSobreBaseline, 0),
    semanasPerfectasClaves: lista(b.semanasPerfectasClaves),
  }
}

function migrarProgreso(bruto) {
  const b = esObjeto(bruto) ? bruto : {}
  return {
    ...b,
    xp: numero(b.xp, 0),
    logros: esObjeto(b.logros) ? b.logros : {},
    contadores: migrarContadores(b.contadores),
    rachaMejor: numero(b.rachaMejor, 0),
    xpLog: lista(b.xpLog),
  }
}

function migrarCuerpo(bruto) {
  const b = esObjeto(bruto) ? bruto : {}
  return {
    ...b,
    pesos: lista(b.pesos),
    medidas: lista(b.medidas),
    fotos: lista(b.fotos),
  }
}

// Toma un objeto cualquiera y devuelve un estado con TODOS los campos del
// modelo §4: defaults donde falte algo, sin destruir los datos presentes (los
// campos desconocidos se conservan). Punto de extensión para versiones futuras:
// cuando exista un modelo v2, la transformación de estados antiguos vive aquí.
export function migrar(bruto) {
  const b = esObjeto(bruto) ? bruto : {}
  return {
    ...b,
    version: 1,
    perfil: migrarPerfil(b.perfil),
    baseline: migrarBaseline(b.baseline),
    ajustes: migrarAjustes(b.ajustes),
    progreso: migrarProgreso(b.progreso),
    ejercicios: lista(b.ejercicios),
    rutinas: lista(b.rutinas),
    sesiones: lista(b.sesiones),
    sesionActiva: esObjeto(b.sesionActiva) ? b.sesionActiva : null,
    pasos: lista(b.pasos),
    cuerpo: migrarCuerpo(b.cuerpo),
  }
}
