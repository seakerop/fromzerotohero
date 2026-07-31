import { IconoAjustes, IconoEntreno, IconoInicio, IconoProgreso, IconoRutinas } from './Iconos.jsx'

const TABS = [
  { id: 'home', Icono: IconoInicio, nombre: 'Inicio' },
  { id: 'entreno', Icono: IconoEntreno, nombre: 'Entreno' },
  { id: 'rutinas', Icono: IconoRutinas, nombre: 'Rutinas' },
  { id: 'progreso', Icono: IconoProgreso, nombre: 'Progreso' },
  { id: 'ajustes', Icono: IconoAjustes, nombre: 'Ajustes' },
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
          <span className="tabbar-icono" aria-hidden="true"><tab.Icono /></span>
          <span>{tab.nombre}</span>
        </button>
      ))}
    </nav>
  )
}
