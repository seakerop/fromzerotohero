import { useEffect, useRef } from 'react'

// Stepper con REPETICIÓN: un toque cambia un paso; mantener pulsado repite
// (400 ms de espera y luego ~11 pasos/segundo). Sin onClick para no duplicar
// el primer paso con el pointerdown.
export default function Stepper({ valor, paso = 1, min = 0, max = Infinity, unidad = '', onCambiar, grande = false }) {
  const decimales = (String(paso).split('.')[1] || '').length
  const valorRef = useRef(valor)
  valorRef.current = valor
  const timers = useRef({ retardo: null, intervalo: null })

  function aplicarPaso(direccion) {
    const actual = valorRef.current
    const bruto = actual + direccion * paso
    const nuevo = Math.min(max, Math.max(min, Number(bruto.toFixed(decimales))))
    if (nuevo !== actual) onCambiar(nuevo)
  }

  function soltar() {
    clearTimeout(timers.current.retardo)
    clearInterval(timers.current.intervalo)
    timers.current.retardo = null
    timers.current.intervalo = null
  }

  function pulsar(direccion) {
    soltar()
    aplicarPaso(direccion)
    timers.current.retardo = setTimeout(() => {
      timers.current.intervalo = setInterval(() => aplicarPaso(direccion), 90)
    }, 400)
  }

  useEffect(() => soltar, [])

  const texto = Number(valor).toLocaleString('es-ES', { maximumFractionDigits: Math.max(decimales, 2) })

  const props = (direccion) => ({
    type: 'button',
    className: 'stepper-btn',
    disabled: direccion < 0 ? valor <= min : valor >= max,
    onPointerDown: (e) => {
      e.preventDefault()
      pulsar(direccion)
    },
    onPointerUp: soltar,
    onPointerLeave: soltar,
    onPointerCancel: soltar,
    onContextMenu: (e) => e.preventDefault(),
    'aria-label': `${direccion < 0 ? 'Restar' : 'Sumar'} ${paso}${unidad ? ` ${unidad}` : ''}`,
  })

  return (
    <div className={grande ? 'stepper stepper-grande' : 'stepper'}>
      <button {...props(-1)}>−</button>
      <div className="stepper-valor">
        {texto}
        {unidad ? <span className="stepper-unidad">{unidad}</span> : null}
      </div>
      <button {...props(1)}>+</button>
    </div>
  )
}
