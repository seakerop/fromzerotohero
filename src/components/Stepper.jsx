export default function Stepper({ valor, paso = 1, min = 0, max = Infinity, unidad = '', onCambiar, grande = false }) {
  const decimales = (String(paso).split('.')[1] || '').length

  function cambiar(direccion) {
    const bruto = valor + direccion * paso
    const nuevo = Math.min(max, Math.max(min, Number(bruto.toFixed(decimales))))
    if (nuevo !== valor) onCambiar(nuevo)
  }

  const texto = Number(valor).toLocaleString('es-ES', { maximumFractionDigits: Math.max(decimales, 2) })

  return (
    <div className={grande ? 'stepper stepper-grande' : 'stepper'}>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => cambiar(-1)}
        disabled={valor <= min}
        aria-label={`Restar ${paso}${unidad ? ` ${unidad}` : ''}`}
      >
        −
      </button>
      <div className="stepper-valor">
        {texto}
        {unidad ? <span className="stepper-unidad">{unidad}</span> : null}
      </div>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => cambiar(1)}
        disabled={valor >= max}
        aria-label={`Sumar ${paso}${unidad ? ` ${unidad}` : ''}`}
      >
        +
      </button>
    </div>
  )
}
