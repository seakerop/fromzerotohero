// Barra de atributo 5-99. `tono` colorea la barra según el atributo
// (tema B · Color de aventura): forja / bosque / acero.
export default function StatBarra({ nombre, icono, valor, tono }) {
  const v = Math.min(99, Math.max(0, Math.round(valor)))
  return (
    <div className={'statbarra' + (tono ? ` statbarra-${tono}` : '')}>
      <div className="statbarra-cab">
        <span className="statbarra-icono" aria-hidden="true">{icono}</span>
        <span>{nombre}</span>
        <span className="statbarra-valor">{v}</span>
      </div>
      <div className="statbarra-pista">
        <div className="statbarra-relleno" style={{ width: `${(v / 99) * 100}%` }} />
      </div>
    </div>
  )
}
