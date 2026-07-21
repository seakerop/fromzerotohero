const TABS = [
  { id: 'home', icono: '🏰', nombre: 'Inicio' },
  { id: 'entreno', icono: '⚔️', nombre: 'Entreno' },
  { id: 'rutinas', icono: '📜', nombre: 'Rutinas' },
  { id: 'progreso', icono: '📈', nombre: 'Progreso' },
  { id: 'ajustes', icono: '⚙️', nombre: 'Ajustes' },
]

export default function TabBar({ activa, onCambiar }) {
  return (
    <nav className="tabbar" aria-label="Navegación principal">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activa === tab.id ? 'tabbar-tab tabbar-tab-activa' : 'tabbar-tab'}
          onClick={() => onCambiar(tab.id)}
          aria-current={activa === tab.id ? 'page' : undefined}
        >
          <span className="tabbar-icono" aria-hidden="true">{tab.icono}</span>
          <span>{tab.nombre}</span>
        </button>
      ))}
    </nav>
  )
}
