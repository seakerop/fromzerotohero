const ICONOS = {
  xp: '✨',
  pr: '🏆',
  logro: '🏅',
  nivel: '👑',
  racha: '🔥',
  info: '💬',
  error: '⚠️',
}

export default function Toasts({ lista }) {
  if (!lista || lista.length === 0) return null
  return (
    <div className="toasts" role="status" aria-live="polite">
      {lista.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.tipo}`}>
          <span className="toast-icono" aria-hidden="true">{ICONOS[toast.tipo] || ICONOS.info}</span>
          <span className="toast-texto">{toast.texto}</span>
        </div>
      ))}
    </div>
  )
}
