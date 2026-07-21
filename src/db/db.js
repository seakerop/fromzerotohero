// Persistencia local — IndexedDB `fzth` v1, sin librerías (CONTRACT.md §6).
// La conexión se abre una sola vez y se reutiliza en todo el módulo db.

const NOMBRE_BD = 'fzth'
const VERSION_BD = 1
const STORE_ESTADO = 'estado'
const STORE_FOTOS = 'fotos'
const CLAVE_ESTADO = 'v1'

let promesaBD = null

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
  await enTransaccion(STORE_ESTADO, 'readwrite', (store) => store.put(estado, CLAVE_ESTADO))
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
