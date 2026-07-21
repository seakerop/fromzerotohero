export default function StatBarra({ nombre, icono, valor }) {
  const v = Math.min(99, Math.max(0, Math.round(valor)))
  return (
    <div className="statbarra">
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
