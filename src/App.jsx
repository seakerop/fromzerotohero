import { useEffect, useRef, useState } from 'react'
import { aplicar, crearEstadoInicial } from './engine/motor.js'
import { claveDia } from './engine/fechas.js'
import { cargarEstado, guardarEstado } from './db/db.js'
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
  const estadoRef = useRef(null)
  const timerGuardado = useRef(null)
  estadoRef.current = estado

  useEffect(() => {
    let vivo = true
    cargarEstado().then((e) => {
      if (!vivo) return
      if (e) {
        const { estado: conTick } = aplicar(e, { tipo: 'tick_diario', hoy: claveDia() })
        setEstado(conTick)
      }
      setCargado(true)
    })
    return () => { vivo = false }
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
  }

  function aplicarEvento(evento) {
    const { estado: nuevo, resultados } = aplicar(estadoRef.current, evento)
    setEstado(nuevo)
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
    setEstado(nuevo)
    resultados.forEach(notificar)
  }

  if (!cargado) {
    return <div className="app-carga"><div className="app-carga-logo">⚔️</div>Cargando…</div>
  }

  if (!estado) {
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
        />
      </main>
      <TabBar activa={vista} onCambiar={setVista} />
      <Toasts lista={toasts} />
    </div>
  )
}
