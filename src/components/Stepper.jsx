import { useEffect, useRef, useState } from 'react'
import { idioma, localeNum, t } from '../i18n/idioma.js'

// Stepper con REPETICIÓN: un toque cambia un paso; mantener pulsado repite
// (400 ms de espera y luego ~11 pasos/segundo). Sin onClick para no duplicar
// el primer paso con el pointerdown. El VALOR central es tocable: se abre un
// campo numérico para teclear directamente (p. ej. 42,5) sin dar 17 toques.
export default function Stepper({ valor, paso = 1, min = 0, max = Infinity, unidad = '', onCambiar, grande = false }) {
  const decimales = (String(paso).split('.')[1] || '').length
  const valorRef = useRef(valor)
  valorRef.current = valor
  const timers = useRef({ retardo: null, intervalo: null })
  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState('')

  function aplicarPaso(direccion) {
    const actual = valorRef.current
    const bruto = actual + direccion * paso
    const nuevo = Math.min(max, Math.max(min, Number(bruto.toFixed(decimales))))
    if (nuevo !== actual) {
      onCambiar(nuevo)
    } else {
      // Tope alcanzado: al deshabilitarse el botón, iOS ya no entrega el
      // pointerup — se para aquí para no dejar un intervalo zombi.
      soltar()
    }
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

  function confirmarEdicion() {
    setEditando(false)
    const n = Number(borrador.replace(',', '.'))
    if (!Number.isFinite(n)) return
    const nuevo = Math.min(max, Math.max(min, Number(n.toFixed(2))))
    if (nuevo !== valorRef.current) onCambiar(nuevo)
  }

  const texto = Number(valor).toLocaleString(localeNum(), { maximumFractionDigits: Math.max(decimales, 2) })

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
    onKeyDown: (e) => {
      // Accesible por teclado: sin esto, quitar onClick dejó Enter/Espacio mudos.
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        aplicarPaso(direccion)
      }
    },
    'aria-label': `${direccion < 0 ? t('Restar', 'Subtract') : t('Sumar', 'Add')} ${paso}${unidad ? ` ${unidad}` : ''}`,
  })

  return (
    <div className={grande ? 'stepper stepper-grande' : 'stepper'}>
      <button {...props(-1)}>−</button>
      {editando ? (
        <input
          className="stepper-valor stepper-entrada"
          type="text"
          inputMode="decimal"
          autoFocus
          value={borrador}
          onChange={(e) => setBorrador(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={confirmarEdicion}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') setEditando(false)
          }}
          aria-label={`${t('Escribir valor', 'Type a value')}${unidad ? ` ${t('en', 'in')} ${unidad}` : ''}`}
        />
      ) : (
        <button
          type="button"
          className="stepper-valor stepper-valor-toca"
          onClick={() => {
            setBorrador(idioma() === 'en' ? String(valor) : String(valor).replace('.', ','))
            setEditando(true)
          }}
          aria-label={`${t('Editar valor', 'Edit value')}: ${texto}${unidad ? ` ${unidad}` : ''}`}
        >
          {texto}
          {unidad ? <span className="stepper-unidad">{unidad}</span> : null}
        </button>
      )}
      <button {...props(1)}>+</button>
    </div>
  )
}
