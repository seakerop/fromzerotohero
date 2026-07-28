import { useState } from 'react'

// Barra + número editable: arrastra para lo grueso, teclea para lo fino.
// Pensado para el onboarding (edad/altura/peso): cero toques repetidos.
export default function Deslizador({ etiqueta, valor, min, max, paso = 1, unidad = '', onCambiar }) {
  const [texto, setTexto] = useState(null) // null = sin edición manual en curso
  const decimales = (String(paso).split('.')[1] || '').length

  function confirmarTexto() {
    if (texto === null) return
    const n = parseFloat(texto.replace(',', '.'))
    if (Number.isFinite(n)) {
      onCambiar(Math.min(max, Math.max(min, Number(n.toFixed(decimales)))))
    }
    setTexto(null)
  }

  return (
    <div className="desliz">
      <div className="desliz-cab">
        <span className="etiqueta desliz-etiqueta">{etiqueta}</span>
        <span className="desliz-valor">
          <input
            className="input desliz-input"
            type="text"
            inputMode={decimales > 0 ? 'decimal' : 'numeric'}
            autoComplete="off"
            value={texto !== null ? texto : Number(valor).toLocaleString('es-ES', { maximumFractionDigits: decimales })}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={confirmarTexto}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
            aria-label={etiqueta}
          />
          {unidad ? <span className="desliz-unidad">{unidad}</span> : null}
        </span>
      </div>
      <input
        className="desliz-barra"
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => onCambiar(Number(e.target.value))}
        aria-label={`${etiqueta} (deslizador)`}
      />
    </div>
  )
}
