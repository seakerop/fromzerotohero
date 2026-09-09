import { useEffect, useRef, useState } from 'react'
import { aplicar, crearEstadoInicial, diasCamino } from './engine/motor.js'
import { claveDia, diasEntre } from './engine/fechas.js'
import { metasRecienCumplidas, nombreDeMeta } from './engine/metas.js'
import { establecerIdioma, idiomaInicial, t } from './i18n/idioma.js'
import { mensajeEstacion, momentoTexto, nombreEtapa, nombreEtapaArbol, nombreLogro } from './i18n/catalogo.js'
import { cargarEstado, guardarEstado } from './db/db.js'
import { estacionDeMes, momentosEntre, MENSAJES_ESTACION } from './components/Avatar.jsx'
import { EJERCICIOS_SEED } from './data/ejercicios.js'

// La biblioteca seed crece con las versiones: fusiona en bibliotecas ya
// creadas los ejercicios nuevos que falten (por id; nunca pisa los tuyos).
function fusionarSeed(e) {
  const porId = new Map(EJERCICIOS_SEED.map((s) => [s.id, s]))
  // Bibliotecas antiguas: rellenar el equipo del seed en entradas que no lo traigan.
  let cambiado = false
  const ejercicios = e.ejercicios.map((x) => {
    const seed = porId.get(x.id)
    if (seed && !x.equipo && seed.equipo) {
      cambiado = true
      return { ...x, equipo: seed.equipo }
    }
    return x
  })
  const faltan = EJERCICIOS_SEED.filter((s) => !ejercicios.some((x) => x.id === s.id))
  if (!cambiado && faltan.length === 0) return e
  return { ...e, ejercicios: [...ejercicios, ...faltan] }
}
import TabBar from './components/TabBar.jsx'
import Toasts from './components/Toasts.jsx'
import Onboarding from './vistas/Onboarding.jsx'
import Home from './vistas/Home.jsx'
import Rutinas from './vistas/Rutinas.jsx'
import Entreno from './vistas/Entreno.jsx'
import Progreso from './vistas/Progreso.jsx'
import Ajustes from './vistas/Ajustes.jsx'

const VISTAS = { home: Home, entreno: Entreno, rutinas: Rutinas, progreso: Progreso, ajustes: Ajustes }

let idToast = 0

export default function App() {
  const [estado, setEstado] = useState(null)
  const [cargado, setCargado] = useState(false)
  const [vista, setVista] = useState('home')
  const [toasts, setToasts] = useState([])
  const [susurro, setSusurro] = useState(null)
  const estadoRef = useRef(null)
  const timerGuardado = useRef(null)
  estadoRef.current = estado

  // El susurro del árbol: al abrir, si algo cambió desde la última visita,
  // UNA tarjeta lo constata (sin hipérboles y sin premiar el mero abrir).
  // Nunca un reproche: si no hay novedad tras días fuera, solo una bienvenida.
  function marcarArbolVisto(e, anunciar) {
    const dias = diasCamino(e)
    const estacion = estacionDeMes(new Date().getMonth() + 1)
    const hoy = claveDia()
    const visto = e.arbolVisto
    if (anunciar && visto) {
      const lineas = []
      const nuevos = momentosEntre(visto.dia ?? 0, dias)
      if (nuevos.length > 0) lineas.push(momentoTexto(nuevos[nuevos.length - 1]).mensaje)
      if (visto.estacion && visto.estacion !== estacion) lineas.push(mensajeEstacion(estacion, MENSAJES_ESTACION))
      if (lineas.length === 0 && visto.fecha && diasEntre(visto.fecha, hoy) >= 7) {
        lineas.push(t(
          'Tu árbol sigue aquí, igual que lo dejaste. Hoy puede crecer.',
          'Your tree is still here, just as you left it. Today it can grow.'
        ))
      }
      if (lineas.length > 0) setSusurro({ lineas })
    }
    return { ...e, arbolVisto: { dia: dias, estacion, fecha: hoy } }
  }

  useEffect(() => {
    let vivo = true
    // Pide almacenamiento persistente: sin esto, iOS puede purgar IndexedDB
    // (estado y fotos) por presión de disco. Mejor esfuerzo.
    try {
      navigator.storage?.persist?.().catch(() => {})
    } catch { /* sin soporte, seguimos */ }
    cargarEstado().then((e) => {
      if (!vivo) return
      if (e) {
        const { estado: conTick } = aplicar(e, { tipo: 'tick_diario', hoy: claveDia() })
        // El susurro se construye AQUÍ: fija el idioma antes de redactarlo.
        establecerIdioma(conTick.ajustes && conTick.ajustes.idioma ? conTick.ajustes.idioma : idiomaInicial())
        setEstado(marcarArbolVisto(fusionarSeed(conTick), true))
      }
      setCargado(true)
    })
    return () => { vivo = false }
  }, [])

  // Volcado inmediato al ocultarse la app: en iOS la PWA se suspende al
  // instante y un debounce pendiente de 300 ms se perdería.
  useEffect(() => {
    function volcar() {
      if (!estadoRef.current) return
      clearTimeout(timerGuardado.current)
      guardarEstado(estadoRef.current)
    }
    function alOcultar() {
      if (document.visibilityState === 'hidden') volcar()
    }
    document.addEventListener('visibilitychange', alOcultar)
    window.addEventListener('pagehide', volcar)
    return () => {
      document.removeEventListener('visibilitychange', alOcultar)
      window.removeEventListener('pagehide', volcar)
    }
  }, [])

  useEffect(() => {
    function alVolver() {
      if (document.visibilityState === 'visible' && estadoRef.current) {
        const { estado: nuevo } = aplicar(estadoRef.current, { tipo: 'tick_diario', hoy: claveDia() })
        setEstado(nuevo)
      }
    }
    document.addEventListener('visibilitychange', alVolver)
    return () => document.removeEventListener('visibilitychange', alVolver)
  }, [])

  useEffect(() => {
    if (!estado) return
    clearTimeout(timerGuardado.current)
    timerGuardado.current = setTimeout(() => guardarEstado(estado), 300)
    return () => clearTimeout(timerGuardado.current)
  }, [estado])

  // Sella las metas cuya condición ya se cumple (capa UI, sin XP propio: el
  // logro de metas caerá con el siguiente evento del motor). El sellado
  // escribe estado una sola vez; al no quedar metas sin sellar, no re-entra.
  useEffect(() => {
    if (!estado || !estado.perfil) return
    const nuevas = metasRecienCumplidas(estado)
    if (nuevas.length === 0) return
    const hoy = claveDia()
    for (const id of nuevas) {
      const meta = estado.metas.find((m) => m.id === id)
      avisar(t(`🎯 Meta cumplida: ${nombreDeMeta(estado, meta)}`, `🎯 Goal reached: ${nombreDeMeta(estado, meta)}`), 'logro')
    }
    setEstado((prev) => ({
      ...prev,
      metas: prev.metas.map((m) => (nuevas.includes(m.id) ? { ...m, cumplidaEl: hoy } : m)),
    }))
  }, [estado])

  function avisar(texto, tipo = 'info') {
    const id = ++idToast
    setToasts((t) => [...t, { id, tipo, texto }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }

  function notificar(r) {
    if (r.tipo === 'xp') avisar(`+${r.cantidad} XP · ${r.motivo}`, 'xp')
    else if (r.tipo === 'pr') avisar(t(`¡PR en ${r.nombre}! ${r.detalle}`, `PR on ${r.nombre}! ${r.detalle}`), 'pr')
    else if (r.tipo === 'logro') avisar(t(`Logro: ${nombreLogro(r.logro)} (+${r.logro.xp} XP)`, `Achievement: ${nombreLogro(r.logro)} (+${r.logro.xp} XP)`), 'logro')
    else if (r.tipo === 'nivel') avisar(t(`¡Nivel ${r.nivel} — ${nombreEtapa(r.etapa)}!`, `Level ${r.nivel} — ${nombreEtapa(r.etapa)}!`), 'nivel')
    else if (r.tipo === 'racha') avisar(t(`Racha: ${r.dias} días`, `Streak: ${r.dias} days`), 'racha')
    else if (r.tipo === 'arbol') avisar(t(`🌳 Tu árbol ha crecido: ${nombreEtapaArbol(r.etapa)}`, `🌳 Your tree has grown: ${nombreEtapaArbol(r.etapa)}`), 'nivel')
  }

  function aplicarEvento(evento) {
    const antes = diasCamino(estadoRef.current)
    const { estado: nuevo, resultados } = aplicar(estadoRef.current, evento)
    const despues = diasCamino(nuevo)
    let final = nuevo
    if (despues > antes) {
      // Un momento del árbol brotó en vivo: susurro como toast, salvo que el
      // motor ya anuncie cambio de etapa (evitamos el doble aviso).
      const nuevos = momentosEntre(antes, despues)
      const huboEtapa = resultados.some((r) => r.tipo === 'arbol')
      if (nuevos.length > 0 && !huboEtapa) {
        avisar(`🌿 ${momentoTexto(nuevos[nuevos.length - 1]).mensaje}`, 'info')
      }
      final = marcarArbolVisto(nuevo, false)
    }
    setEstado(final)
    resultados.forEach(notificar)
    return resultados
  }

  function actualizarEstado(mutador) {
    setEstado((prev) => mutador(prev))
  }

  function crearPersonaje(respuestas) {
    const hoy = claveDia()
    const inicial = crearEstadoInicial({ ...respuestas, hoy })
    const { estado: nuevo, resultados } = aplicar(inicial, { tipo: 'perfil_creado', hoy })
    const conIdioma = { ...nuevo, ajustes: { ...nuevo.ajustes, idioma: idiomaInicial() } }
    setEstado(marcarArbolVisto(conIdioma, false))
    resultados.forEach(notificar)
  }

  // El idioma vive en ajustes; fijarlo aquí hace que t() lo vea en el render.
  establecerIdioma(estado && estado.ajustes && estado.ajustes.idioma ? estado.ajustes.idioma : idiomaInicial())

  if (!cargado) {
    return <div className="app-carga"><div className="app-carga-logo">⚔️</div>{t('Cargando…', 'Loading…')}</div>
  }

  if (!estado || !estado.perfil) {
    // Sin estado o sin perfil (migración/copia parcial): forja de personaje
    // a pantalla completa (CONTRACT §17), nunca una pantalla en blanco.
    return (
      <>
        <Onboarding alTerminar={crearPersonaje} />
        <Toasts lista={toasts} />
      </>
    )
  }

  const Vista = VISTAS[vista] || Home

  return (
    <div className="app">
      <main className="app-contenido">
        <Vista
          estado={estado}
          actualizarEstado={actualizarEstado}
          aplicarEvento={aplicarEvento}
          irA={setVista}
          avisar={avisar}
          susurro={susurro}
          cerrarSusurro={() => setSusurro(null)}
        />
      </main>
      <TabBar activa={vista} onCambiar={setVista} />
      <Toasts lista={toasts} />
    </div>
  )
}
