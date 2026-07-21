import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/base.css'
import './styles/componentes.css'
import './styles/entreno.css'
import './styles/progreso.css'
import { registrarSW } from './pwa.js'

createRoot(document.getElementById('raiz')).render(<App />)
registrarSW()
