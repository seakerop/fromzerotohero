export default function BarraXP({ progreso = 0, etiqueta = '' }) {
  const ancho = `${Math.min(100, Math.max(0, progreso * 100))}%`
  return (
    <div className="barraxp">
      <div className="barraxp-pista">
        <div className="barraxp-relleno" style={{ width: ancho }} />
      </div>
      {etiqueta ? <div className="barraxp-etiqueta">{etiqueta}</div> : null}
    </div>
  )
}
