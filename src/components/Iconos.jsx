// Iconos de línea propios (tema «Piedra y oro»): mismo trazo en todos,
// coloreados por currentColor. Adiós a los emojis del sistema en el chrome
// de la app (los emojis de CONTENIDO — logros, suplementos — se quedan).

function Icono({ children, tam = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={tam} height={tam} fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export function IconoInicio({ tam }) {
  return (
    <Icono tam={tam}>
      <path d="M4 20V10.5L7 8V5h2v2l3-2.5L21 10.5V20h-5v-5h-4v5H4Z" />
    </Icono>
  )
}

export function IconoEntreno({ tam }) {
  return (
    <Icono tam={tam}>
      <path d="M4 4l9 9M20 4l-9 9M4 4v3M4 4h3M20 4v3M20 4h-3M6.5 17.5l-2 2M8 19l-3-3M17.5 17.5l2 2M16 19l3-3" />
    </Icono>
  )
}

export function IconoRutinas({ tam }) {
  return (
    <Icono tam={tam}>
      <path d="M7 3h10a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z" />
      <path d="M9 8h6M9 12h6" />
    </Icono>
  )
}

export function IconoProgreso({ tam }) {
  return (
    <Icono tam={tam}>
      <path d="M4 20h16M5 16l4-5 3 3 6-8" />
      <circle cx="18" cy="6" r="1.4" fill="currentColor" stroke="none" />
    </Icono>
  )
}

export function IconoAjustes({ tam }) {
  return (
    <Icono tam={tam}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </Icono>
  )
}

export function IconoRacha({ tam }) {
  return (
    <Icono tam={tam}>
      <path d="M12 3c1 3-1.5 4.5-1.5 7a4 4 0 0 0 3 3.9c2-.6 3-2.4 2.6-4.4C18.5 11 20 13 20 15.5A7 7 0 0 1 6 16c0-4 3-5.5 4-8.5.4-1.2.5-2.8 2-4.5Z" />
    </Icono>
  )
}
