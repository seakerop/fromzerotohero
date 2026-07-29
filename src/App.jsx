import { useEffect, useRef, useState } from 'react'
import { aplicar, crearEstadoInicial, diasCamino } from './engine/motor.js'
import { claveDia, diasEntre } from './engine/fechas.js'
import { cargarEstado, guardarEstado } from './db/db.js'
import { estacionDeMes, momentosEntre, MENSAJES_ESTACION } from './components/Avatar.jsx'
import { EJERCICIOS_SEED } from './data/ejercicios.js'

// La biblioteca seed crece con las versiones: fusiona en bibliotecas ya
// creadas los ejercicios nuevos que falten (por id; nunca pisa los tuyos).
function fusionarSeed(e) {
  const faltan = EJERCICIOS_SEED.filter((s) => !e.ejercicios.some((x) => x.id === s.id))
  if (faltan.length === 0) return e
  return { ...e, ejercicios: [...e.ejercicios, ...faltan] }
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
      if (nuevos.length > 0) lineas.push(nuevos[nuevos.length - 1].mensaje)
      if (visto.estacion && visto.estacion !== estacion) lineas.push(MENSAJES_ESTACION[estacion])
      if (lineas.length === 0 && visto.fecha && diasEntre(visto.fecha, hoy) >= 7) {
        lineas.push('Tu árbol sigue aquí, igual que lo dejaste. Hoy puede crecer.')
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

  function avisar(texto, tipo = 'info') {
    const id = ++idToast
    setToasts((t) => [...t, { id, tipo, texto }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }

  function notificar(r) {
    if (r.tipo === 'xp') avisar(`+${r.cantidad} XP · ${r.motivo}`, 'xp')
    else if (r.tipo === 'pr') avisar(`¡PR en ${r.nombre}! ${r.detalle}`, 'pr')
    else if (r.tipo === 'logro') avisar(`Logro: ${r.logro.nombre} (+${r.logro.xp} XP)`, 'logro')
    else if (r.tipo === 'nivel') avisar(`¡Nivel ${r.nivel} — ${r.etapa.nombre}!`, 'nivel')
    else if (r.tipo === 'racha') avisar(`Racha: ${r.dias} días`, 'racha')
    else if (r.tipo === 'arbol') avisar(`🌳 Tu árbol ha crecido: ${r.etapa.nombre}`, 'nivel')
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
        avisar(`🌿 ${nuevos[nuevos.length - 1].mensaje}`, 'info')
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
    setEstado(marcarArbolVisto(nuevo, false))
    resultados.forEach(notificar)
  }

  if (!cargado) {
    return <div className="app-carga"><div className="app-carga-logo">⚔️</div>Cargando…</div>
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
