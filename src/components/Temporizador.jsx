import { useEffect, useRef, useState } from 'react'

// Triple pitido con WebAudio (oscilador puro, sin assets). Mejor esfuerzo:
// si el navegador no deja sonar, no pasa nada.
function pitar() {
  try {
    const Contexto = window.AudioContext || window.webkitAudioContext
    if (!Contexto) return
    const ctx = new Contexto()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const osc = ctx.createOscillator()
    const ganancia = ctx.createGain()
    const t0 = ctx.currentTime
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, t0)
    osc.frequency.setValueAtTime(880, t0 + 0.3)
    osc.frequency.setValueAtTime(1175, t0 + 0.6)
    ganancia.gain.setValueAtTime(0.0001, t0)
    ;[0, 0.3, 0.6].forEach((d) => {
      ganancia.gain.setValueAtTime(0.0001, t0 + d)
      ganancia.gain.exponentialRampToValueAtTime(0.4, t0 + d + 0.03)
      ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.24)
    })
    osc.connect(ganancia)
    ganancia.connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + 0.95)
    osc.onended = () => { ctx.close().catch(() => {}) }
  } catch {
    // sin audio no se rompe el descanso
  }
}

export default function Temporizador({ segundos, alCerrar }) {
  const [fin, setFin] = useState(() => Date.now() + segundos * 1000)
  const [total, setTotal] = useState(segundos)
  const [restante, setRestante] = useState(segundos)
  const avisado = useRef(false)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setRestante(Math.max(0, Math.ceil((fin - Date.now()) / 1000)))
    }, 200)
    return () => clearInterval(intervalo)
  }, [fin])

  useEffect(() => {
    if (restante > 0) {
      avisado.current = false
      return undefined
    }
    if (avisado.current) return undefined
    avisado.current = true
    pitar()
    if (navigator.vibrate) navigator.vibrate([220, 110, 220])
    const cierre = setTimeout(alCerrar, 1800)
    return () => clearTimeout(cierre)
  }, [restante, alCerrar])

  function extender() {
    setFin((f) => Math.max(f, Date.now()) + 30000)
    setTotal((t) => t + 30)
  }

  const progreso = total > 0 ? Math.min(1, restante / total) : 0
  const minutos = Math.floor(restante / 60)
  const segs = restante % 60

  return (
    <div className="ent-tempo" role="timer" aria-live="polite">
      <div className="ent-tempo-barra">
        <div className="ent-tempo-barra-relleno" style={{ width: `${Math.round(progreso * 100)}%` }} />
      </div>
      <div className="ent-tempo-fila">
        <div className="ent-tempo-info">
          <span className="ent-tempo-etiqueta">{restante > 0 ? 'Descanso' : '¡A por la siguiente!'}</span>
          <span className="ent-tempo-cuenta">{minutos}:{String(segs).padStart(2, '0')}</span>
        </div>
        <button className="btn ent-tempo-btn" onClick={extender}>+30 s</button>
        <button className="btn ent-tempo-btn" onClick={alCerrar}>Saltar</button>
      </div>
    </div>
  )
}
