import { forwardRef } from 'react'
import Avatar from './Avatar.jsx'
import { claveDia, claveSemana, diaISO, formatearFecha, sumarDias } from '../engine/fechas.js'
import { calcularRacha, diasCamino, etapaArbol, nivelDesdeXp } from '../engine/motor.js'

// La Tarjeta de Gesta: tu semana como imagen para el pacto de hermanos.
// TODO en atributos SVG (nada de clases CSS): la tarjeta se serializa y se
// rasteriza a PNG, y ahí las hojas de estilo del documento no viajan.
// Tono sobrio: hechos de la semana, sin confeti.

const FUENTE = "-apple-system, 'Segoe UI', Roboto, sans-serif"
const ORO = '#d9a441'
const ORO_CLARO = '#f0c86e'
const TEXTO = '#e8e6df'
const SUAVE = '#98a0b8'
const LETRAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function datosGesta(estado) {
  const hoy = claveDia()
  const nv = nivelDesdeXp(estado.progreso.xp)
  const dias = diasCamino(estado)
  const semanaClave = claveSemana(hoy)
  const lunes = sumarDias(hoy, 1 - diaISO(hoy))
  const fechasConSesion = new Set(estado.sesiones.map((s) => s.fecha))
  const planificados = new Set(estado.ajustes.diasPlanificados)
  const semana = LETRAS.map((letra, i) => {
    const fecha = sumarDias(lunes, i)
    return { letra, plan: planificados.has(i + 1), hecho: fechasConSesion.has(fecha), esHoy: fecha === hoy }
  })
  const xpSemana = estado.progreso.xpLog
    .filter((e) => claveSemana(e.fecha) === semanaClave)
    .reduce((n, e) => n + e.cantidad, 0)
  return { hoy, nv, dias, etapaA: etapaArbol(dias), racha: calcularRacha(estado, hoy), semana, xpSemana, lunes }
}

const TarjetaGesta = forwardRef(function TarjetaGesta({ estado }, ref) {
  const { hoy, nv, dias, etapaA, racha, semana, xpSemana, lunes } = datosGesta(estado)
  const pacto = estado.pacto || null

  return (
    <svg
      ref={ref}
      viewBox="0 0 540 675"
      width="100%"
      role="img"
      aria-label="Tu tarjeta de gesta semanal"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="540" height="675" fill="#0c0e13" />
      <rect x="14" y="14" width="512" height="647" rx="20" fill="none" stroke={ORO} strokeOpacity="0.45" strokeWidth="1.5" />

      <text x="270" y="52" textAnchor="middle" fontFamily={FUENTE} fontSize="14" fontWeight="700"
        letterSpacing="3" fill={ORO}>⚔️ FROMZEROTOHERO</text>

      <text x="270" y="96" textAnchor="middle" fontFamily={FUENTE} fontSize="34" fontWeight="800"
        fill={TEXTO}>{estado.perfil.apodo}</text>
      <text x="270" y="122" textAnchor="middle" fontFamily={FUENTE} fontSize="16" fontWeight="700"
        fill={ORO_CLARO}>{nv.etapa.nombre} · Nivel {nv.nivel}</text>

      <g transform="translate(150, 138) scale(2)">
        <Avatar dias={dias} tam={120} />
      </g>

      <text x="270" y="408" textAnchor="middle" fontFamily={FUENTE} fontSize="15"
        fill={SUAVE}>🌱 {etapaA.nombre} · día {dias} del camino</text>

      <text x="270" y="452" textAnchor="middle" fontFamily={FUENTE} fontSize="21" fontWeight="700"
        fill={TEXTO}>🔥 {racha} {racha === 1 ? 'día de racha' : 'días de racha'}</text>

      {semana.map((dia, i) => {
        const cx = 90 + i * 60
        const cy = 502
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="17"
              fill={dia.hecho ? 'rgba(217,164,65,0.16)' : 'none'}
              stroke={dia.hecho ? ORO : dia.plan ? '#3a4258' : '#242a3a'}
              strokeWidth={dia.hecho ? 2 : 1.4} />
            <text x={cx} y={cy + 4} textAnchor="middle" fontFamily={FUENTE} fontSize="12"
              fontWeight="700" fill={dia.hecho ? ORO_CLARO : dia.plan ? SUAVE : '#4a5168'}>{dia.letra}</text>
            {dia.hecho && (
              <text x={cx} y={cy + 30} textAnchor="middle" fontFamily={FUENTE} fontSize="12"
                fill={ORO}>✓</text>
            )}
          </g>
        )
      })}

      <text x="270" y="576" textAnchor="middle" fontFamily={FUENTE} fontSize="16"
        fill={TEXTO}>+{xpSemana} XP esta semana</text>

      {pacto && pacto.nombre ? (
        <text x="270" y="614" textAnchor="middle" fontFamily={FUENTE} fontSize="15" fontWeight="700"
          fill={ORO_CLARO}>🤝 Pacto con {pacto.nombre}</text>
      ) : null}
      <text x="270" y={pacto && pacto.nombre ? 636 : 616} textAnchor="middle" fontFamily={FUENTE}
        fontSize="12" fill={SUAVE}>semana del {formatearFecha(lunes)} · {formatearFecha(hoy)}</text>

      <text x="270" y="658" textAnchor="middle" fontFamily={FUENTE} fontSize="11"
        fill={SUAVE} fillOpacity="0.7">El XP nace de lo que haces.</text>
    </svg>
  )
})

export default TarjetaGesta

// Serializa el SVG de la tarjeta, lo rasteriza a PNG (1080×1350) y lo comparte
// con la hoja del sistema; si no se puede compartir, lo descarga.
export async function compartirTarjeta(svgNode, avisar) {
  const hoy = claveDia()
  const nombreFichero = `gesta-${hoy}.png`
  try {
    const serializado = new XMLSerializer().serializeToString(svgNode)
    const svgBlob = new Blob([serializado], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const imagen = await new Promise((res, rej) => {
      const img = new Image()
      img.onload = () => res(img)
      img.onerror = rej
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imagen, 0, 0, 1080, 1350)
    URL.revokeObjectURL(url)
    const png = await new Promise((res, rej) => {
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('sin blob'))), 'image/png')
    })
    const archivo = new File([png], nombreFichero, { type: 'image/png' })

    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: 'Mi gesta de la semana' })
        avisar('Gesta compartida. El pacto sigue en pie.')
        return
      } catch (err) {
        if (err && err.name === 'AbortError') return
        // si la hoja falla, cae a la descarga
      }
    }
    const enlace = document.createElement('a')
    enlace.href = URL.createObjectURL(png)
    enlace.download = nombreFichero
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000)
    avisar('Tarjeta descargada: mándasela a tu hermano de pacto.')
  } catch {
    avisar('No se pudo generar la tarjeta', 'error')
  }
}
