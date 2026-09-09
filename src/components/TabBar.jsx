import { IconoAjustes, IconoEntreno, IconoInicio, IconoProgreso, IconoRutinas } from './Iconos.jsx'
import { t } from '../i18n/idioma.js'

const TABS = [
  { id: 'home', Icono: IconoInicio, nombre: () => t('Inicio', 'Home') },
  { id: 'entreno', Icono: IconoEntreno, nombre: () => t('Entreno', 'Workout') },
  { id: 'rutinas', Icono: IconoRutinas, nombre: () => t('Rutinas', 'Routines') },
  { id: 'progreso', Icono: IconoProgreso, nombre: () => t('Progreso', 'Progress') },
  { id: 'ajustes', Icono: IconoAjustes, nombre: () => t('Ajustes', 'Settings') },
]

export default function TabBar({ activa, onCambiar }) {
  return (
    <nav className="tabbar" aria-label={t('Navegación principal', 'Main navigation')}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activa === tab.id ? 'tabbar-tab tabbar-tab-activa' : 'tabbar-tab'}
          onClick={() => onCambiar(tab.id)}
          aria-current={activa === tab.id ? 'page' : undefined}
        >
          <span className="tabbar-icono" aria-hidden="true"><tab.Icono /></span>
          <span>{tab.nombre()}</span>
        </button>
      ))}
    </nav>
  )
}
