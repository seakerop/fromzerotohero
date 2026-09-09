import { useEffect, useMemo, useRef, useState } from 'react'
import FichaEjercicio from '../components/FichaEjercicio.jsx'
import GraficaLinea from '../components/GraficaLinea.jsx'
import MiniEjercicio from '../components/MiniEjercicio.jsx'
import Modal from '../components/Modal.jsx'
import { claveDia, formatearFecha } from '../engine/fechas.js'
import { borrarSesion, historicoEjercicio, pesosConMedia, progresoEjercicio, volumenSemanal } from '../engine/motor.js'
import { ejerciciosDistintos, volumenTotal } from '../engine/logros.js'
import { estadoDeMeta, HORIZONTES, medidaDeMeta, nombreDeMeta, nombreHorizonte, pesoReferencia, valorActualDeMeta } from '../engine/metas.js'
import { LOGROS } from '../data/logros.js'
import { diasDeAccion } from '../engine/arbol.js'
import { guardarFoto, cargarFoto, borrarFoto } from '../db/fotos.js'
import { idioma, t } from '../i18n/idioma.js'
import { descLogro, nombreEjercicio, nombreLogro } from '../i18n/catalogo.js'

const PESTANAS = [
  ['diario', () => t('Diario', 'Journal')],
  ['fuerza', () => t('Fuerza', 'Strength')],
  ['volumen', () => t('Volumen', 'Volume')],
  ['cuerpo', () => t('Cuerpo', 'Body')],
  ['metas', () => t('Metas', 'Goals')],
  ['logros', () => t('Logros', 'Achievements')],
]

const TIPOS_FOTO = [
  ['frente', () => t('Frente', 'Front')],
  ['lado', () => t('Lado', 'Side')],
  ['espalda', () => t('Espalda', 'Back')],
]

const ETIQUETAS_MEDIDAS = {
  cinturaCm: () => t('Cintura', 'Waist'),
  pechoCm: () => t('Pecho', 'Chest'),
  brazoCm: () => t('Brazo', 'Arm'),
  musloCm: () => t('Muslo', 'Thigh'),
  caderaCm: () => t('Cadera', 'Hip'),
}

function fmtNum(v) {
  const r = Math.round(v * 10) / 10
  const s = Number.isInteger(r) ? String(r) : r.toFixed(1)
  return idioma() === 'en' ? s : s.replace('.', ',')
}

function fmtKg(v) {
  if (v >= 10000) return `${Math.round(v / 1000)}k`
  if (v >= 1000) {
    const s = (Math.round(v / 100) / 10).toFixed(1)
    return `${idioma() === 'en' ? s : s.replace('.', ',')}k`
  }
  return String(Math.round(v))
}

function nombreTipoFoto(tipo) {
  const par = TIPOS_FOTO.find(([id]) => id === tipo)
  return par ? par[1]() : tipo
}

function TabFuerza({ estado }) {
  const conDatos = useMemo(() => {
    const ids = new Set()
    for (const s of estado.sesiones) {
      for (const e of s.ejercicios) ids.add(e.ejercicioId)
    }
    return estado.ejercicios.filter((e) => ids.has(e.id))
  }, [estado.sesiones, estado.ejercicios])

  const [elegidoId, setElegidoId] = useState(null)
  const [verFicha, setVerFicha] = useState(false)
  const elegido = conDatos.find((e) => e.id === elegidoId) || conDatos[0]

  if (!elegido) {
    return (
      <div className="panel prog-vacio">
        <p>{t('Tu leyenda aún no tiene números.', 'Your legend has no numbers yet.')}</p>
        <p className="texto-suave">{t('Completa tu primer entreno y aquí verás crecer tu fuerza sesión a sesión.', 'Complete your first workout and you will watch your strength grow session by session.')}</p>
      </div>
    )
  }

  const h = historicoEjercicio(estado, elegido.id)

  let series
  let unidad
  if (elegido.medida === 'peso_reps') {
    const datos = progresoEjercicio(estado, elegido.id)
    series = [
      {
        nombre: t('Mejor peso', 'Best weight'),
        color: 'var(--oro)',
        puntos: datos.map((d) => ({ x: d.fecha, y: d.mejorPesoKg })),
      },
      {
        nombre: 'e1RM',
        color: 'var(--plata)',
        puntos: datos.filter((d) => d.e1rmKg != null).map((d) => ({ x: d.fecha, y: d.e1rmKg })),
      },
    ]
    unidad = 'kg'
  } else {
    const puntos = []
    for (const s of estado.sesiones) {
      let mejor = null
      for (const ej of s.ejercicios) {
        if (ej.ejercicioId !== elegido.id) continue
        for (const serie of ej.series) {
          if (mejor === null || serie.reps > mejor) mejor = serie.reps
        }
      }
      if (mejor !== null) puntos.push({ x: s.fecha, y: mejor })
    }
    unidad = elegido.medida === 'tiempo' ? 'min' : 'reps'
    series = [
      {
        nombre: elegido.medida === 'tiempo' ? t('Mejores minutos', 'Best minutes') : t('Mejores reps', 'Best reps'),
        color: 'var(--oro)',
        puntos,
      },
    ]
  }

  return (
    <>
      <label className="etiqueta" htmlFor="prog-sel-ejercicio">{t('Ejercicio', 'Exercise')}</label>
      <select
        id="prog-sel-ejercicio"
        className="input"
        value={elegido.id}
        onChange={(e) => setElegidoId(e.target.value)}
      >
        {conDatos.map((e) => (
          <option key={e.id} value={e.id}>{nombreEjercicio(e)}</option>
        ))}
      </select>
      <div className="prog-fuerza-cab">
        <MiniEjercicio id={elegido.id} />
        <div className="prog-resumen">
          <span className="chip">{t('Sesiones', 'Sessions')}: {h.vecesHecho}</span>
          {h.mejorPesoKg != null && <span className="chip">{t('Mejor', 'Best')}: {fmtNum(h.mejorPesoKg)} kg</span>}
          {h.mejor1rmKg != null && <span className="chip">e1RM: {fmtNum(h.mejor1rmKg)} kg</span>}
          {h.mejorReps != null && <span className="chip">{t('Mejor', 'Best')}: {h.mejorReps} reps</span>}
          {h.mejorMinutos != null && <span className="chip">{t('Mejor', 'Best')}: {h.mejorMinutos} min</span>}
        </div>
        <button className="rut-info" aria-label={t(`Ver técnica de ${nombreEjercicio(elegido)}`, `View technique for ${nombreEjercicio(elegido)}`)} onClick={() => setVerFicha(true)}>
          ⓘ
        </button>
      </div>
      <FichaEjercicio ejercicio={elegido} abierto={verFicha} onCerrar={() => setVerFicha(false)} />
      <div className="panel prog-grafica">
        <GraficaLinea series={series} unidad={unidad} alto={190} />
      </div>
      <p className="texto-suave prog-nota">
        {t('Cada punto es una sesión. La línea sube porque tú subes.', 'Each point is a session. The line rises because you rise.')}
      </p>
    </>
  )
}

function TabVolumen({ estado }) {
  const semanas = volumenSemanal(estado).slice(-12)

  if (!semanas.length) {
    return (
      <div className="panel prog-vacio">
        <p>{t('Todavía no has movido kilos que contar.', 'No kilos moved worth counting yet.')}</p>
        <p className="texto-suave">{t('Cada serie con peso que completes sumará a esta gráfica.', 'Every weighted set you complete will add to this chart.')}</p>
      </div>
    )
  }

  const ANCHO = 360
  const ALTO = 200
  const MT = 22
  const MB = 26
  const ML = 8
  const MR = 8
  const max = Math.max(...semanas.map((s) => s.kg), 1)
  const banda = (ANCHO - ML - MR) / semanas.length
  const anchoBarra = Math.min(30, banda * 0.62)

  return (
    <>
      <div className="panel prog-grafica">
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          preserveAspectRatio="xMidYMid meet"
          className="prog-gl-svg"
          role="img"
          aria-label={t('Volumen semanal en kilos', 'Weekly volume in kilos')}
        >
          <line x1={ML} y1={ALTO - MB} x2={ANCHO - MR} y2={ALTO - MB} stroke="var(--borde)" strokeWidth="1" />
          {semanas.map((s, i) => {
            const altoBarra = ((ALTO - MT - MB) * s.kg) / max
            const x = ML + i * banda + (banda - anchoBarra) / 2
            const y = ALTO - MB - altoBarra
            const ultima = i === semanas.length - 1
            return (
              <g key={s.semana}>
                <rect
                  x={x}
                  y={y}
                  width={anchoBarra}
                  height={Math.max(altoBarra, 2)}
                  rx="4"
                  fill={ultima ? 'var(--oro-claro)' : 'var(--oro)'}
                  fillOpacity={ultima ? 1 : 0.75}
                />
                <text x={x + anchoBarra / 2} y={y - 5} textAnchor="middle" fontSize="8.5" fill="var(--texto-suave)">
                  {fmtKg(s.kg)}
                </text>
                <text x={x + anchoBarra / 2} y={ALTO - 8} textAnchor="middle" fontSize="8.5" fill="var(--texto-suave)">
                  {`${t('S', 'W')}${s.semana.split('-W')[1]}`}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="texto-suave prog-nota">
        {t(
          'Kilos movidos por semana: suma de peso × repeticiones de tus series con peso. Últimas 12 semanas.',
          'Kilos moved per week: the sum of weight × reps across your weighted sets. Last 12 weeks.'
        )}
      </p>
    </>
  )
}

function TabCuerpo({ estado, aplicarEvento, actualizarEstado, avisar }) {
  const hoy = claveDia()
  const datos = pesosConMedia(estado)
  const fotos = estado.cuerpo.fotos

  const [pesoTxt, setPesoTxt] = useState('')
  const [medidasTxt, setMedidasTxt] = useState({ cinturaCm: '', pechoCm: '', brazoCm: '', musloCm: '', caderaCm: '' })
  const [tipoFoto, setTipoFoto] = useState('frente')
  const [urls, setUrls] = useState({})
  const [compA, setCompA] = useState('')
  const [compB, setCompB] = useState('')
  const [fotoAbierta, setFotoAbierta] = useState(null)
  const [confirmaBorrado, setConfirmaBorrado] = useState(false)
  const urlsRef = useRef(new Map())
  const montadoRef = useRef(true)

  useEffect(() => {
    for (const f of fotos) {
      if (urlsRef.current.has(f.id)) continue
      urlsRef.current.set(f.id, null)
      cargarFoto(f.id).then((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        if (!montadoRef.current) {
          URL.revokeObjectURL(url)
          return
        }
        urlsRef.current.set(f.id, url)
        setUrls((u) => ({ ...u, [f.id]: url }))
      })
    }
  }, [fotos])

  useEffect(() => {
    return () => {
      montadoRef.current = false
      for (const url of urlsRef.current.values()) {
        if (url) URL.revokeObjectURL(url)
      }
      urlsRef.current.clear()
    }
  }, [])

  const pesoHoy = estado.cuerpo.pesos.find((p) => p.fecha === hoy)
  const ultimoPeso = estado.cuerpo.pesos[estado.cuerpo.pesos.length - 1]

  function guardarPeso() {
    const kg = Math.round(Number(pesoTxt.replace(',', '.')) * 10) / 10
    if (!kg || kg <= 0 || kg > 400) {
      avisar(t('Escribe un peso válido en kg', 'Enter a valid weight in kg'), 'error')
      return
    }
    const resultados = aplicarEvento({ tipo: 'peso', fecha: hoy, kg })
    if (!resultados.length) avisar(t('Peso del día actualizado', "Today's weight updated"))
    setPesoTxt('')
  }

  function guardarMedidas() {
    const medidas = {}
    let alguna = false
    for (const campo of Object.keys(ETIQUETAS_MEDIDAS)) {
      const txt = medidasTxt[campo]
      const v = Number(String(txt).replace(',', '.'))
      if (txt !== '' && v > 0) {
        medidas[campo] = Math.round(v * 10) / 10
        alguna = true
      } else {
        medidas[campo] = null
      }
    }
    if (!alguna) {
      avisar(t('Añade al menos una medida', 'Add at least one measurement'), 'error')
      return
    }
    const resultados = aplicarEvento({ tipo: 'medidas', fecha: hoy, medidas })
    if (!resultados.length) avisar(t('Medidas guardadas', 'Measurements saved'))
    setMedidasTxt({ cinturaCm: '', pechoCm: '', brazoCm: '', musloCm: '', caderaCm: '' })
  }

  async function alElegirFoto(ev) {
    const fichero = ev.target.files && ev.target.files[0]
    ev.target.value = ''
    if (!fichero) return
    try {
      const id = await guardarFoto({ fecha: hoy, tipo: tipoFoto, blob: fichero })
      const resultados = aplicarEvento({ tipo: 'foto', fecha: hoy, fotoId: id, fotoTipo: tipoFoto })
      if (!resultados.length) avisar(t('Foto guardada', 'Photo saved'))
    } catch {
      avisar(t('No se pudo guardar la foto', 'The photo could not be saved'), 'error')
    }
  }

  function abrirFoto(f) {
    setFotoAbierta(f)
    setConfirmaBorrado(false)
  }

  function cerrarFoto() {
    setFotoAbierta(null)
    setConfirmaBorrado(false)
  }

  async function alBorrarFoto() {
    if (!confirmaBorrado) {
      setConfirmaBorrado(true)
      return
    }
    const f = fotoAbierta
    cerrarFoto()
    try {
      await borrarFoto(f.id)
    } catch {
      /* si el blob ya no existe seguimos limpiando los metadatos */
    }
    const url = urlsRef.current.get(f.id)
    if (url) URL.revokeObjectURL(url)
    urlsRef.current.delete(f.id)
    setUrls((u) => {
      const copia = { ...u }
      delete copia[f.id]
      return copia
    })
    actualizarEstado((prev) => ({
      ...prev,
      cuerpo: { ...prev.cuerpo, fotos: prev.cuerpo.fotos.filter((x) => x.id !== f.id) },
    }))
    avisar(t('Foto borrada', 'Photo deleted'))
  }

  const seriesPeso = [
    {
      nombre: t('Registros', 'Entries'),
      color: 'var(--texto-suave)',
      fino: true,
      puntos: datos.map((d) => ({ x: d.fecha, y: d.kg })),
    },
    {
      nombre: t('Media (7 registros)', 'Average (7 entries)'),
      color: 'var(--oro)',
      puntos: datos.filter((d) => d.media7 != null).map((d) => ({ x: d.fecha, y: d.media7 })),
    },
  ]

  const galeria = fotos.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
  const fotosAsc = fotos.slice().sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0))
  const fotoA = fotosAsc.find((f) => f.id === compA) || fotosAsc[0]
  const fotoB = fotosAsc.find((f) => f.id === compB) || fotosAsc[fotosAsc.length - 1]
  const medidasRecientes = estado.cuerpo.medidas.slice(-4).reverse()

  return (
    <>
      <div className="titulo-seccion">{t('Peso', 'Weight')}</div>
      <div className="panel">
        <GraficaLinea series={seriesPeso} unidad="kg" alto={190} />
        <p className="texto-suave prog-nota">
          {t(
            'La línea dorada es tu media de 7 registros; los puntos finos, el dato de cada día. Aquí tu peso es solo información: la app nunca lo puntúa.',
            "The golden line is your 7-entry average; the thin points, each day's number. Here your weight is information only: the app never scores it."
          )}
        </p>
        <div className="fila prog-form-peso">
          <input
            className="input"
            type="text"
            inputMode="decimal"
            placeholder={t('p. ej. 92,4', 'e.g. 92.4')}
            aria-label={t('Peso de hoy en kilos', "Today's weight in kilos")}
            value={pesoTxt}
            onChange={(e) => setPesoTxt(e.target.value)}
          />
          <button className="btn btn-primario" onClick={guardarPeso}>{t('Guardar', 'Save')}</button>
        </div>
        {pesoHoy ? (
          <p className="texto-suave prog-nota">{t(`Hoy: ${fmtNum(pesoHoy.kg)} kg registrados.`, `Today: ${fmtNum(pesoHoy.kg)} kg logged.`)}</p>
        ) : ultimoPeso ? (
          <p className="texto-suave prog-nota">{t('Último registro', 'Last entry')}: {fmtNum(ultimoPeso.kg)} kg · {formatearFecha(ultimoPeso.fecha)}</p>
        ) : null}
      </div>

      <div className="titulo-seccion">{t('Medidas', 'Measurements')}</div>
      <div className="panel">
        <div className="grid-2 prog-medidas-form">
          {Object.entries(ETIQUETAS_MEDIDAS).map(([campo, etiqueta]) => (
            <div key={campo}>
              <label className="etiqueta" htmlFor={`prog-med-${campo}`}>{etiqueta()} (cm)</label>
              <input
                id={`prog-med-${campo}`}
                className="input"
                type="text"
                inputMode="decimal"
                value={medidasTxt[campo]}
                onChange={(e) => setMedidasTxt((m) => ({ ...m, [campo]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primario prog-btn-bloque" onClick={guardarMedidas}>{t('Guardar medidas', 'Save measurements')}</button>
        {medidasRecientes.length > 0 && (
          <ul className="prog-medidas-lista">
            {medidasRecientes.map((m) => (
              <li key={m.fecha}>
                <span className="oro">{formatearFecha(m.fecha)}</span>{' '}
                {Object.entries(ETIQUETAS_MEDIDAS)
                  .filter(([campo]) => m[campo] != null)
                  .map(([campo, etiqueta]) => `${etiqueta()} ${fmtNum(m[campo])}`)
                  .join(' · ')}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="titulo-seccion">{t('Fotos de progreso', 'Progress photos')}</div>
      <div className="panel">
        <div className="fila prog-tipos-foto">
          {TIPOS_FOTO.map(([id, nombre]) => (
            <button
              key={id}
              className={tipoFoto === id ? 'chip chip-activo prog-chip-tacto' : 'chip prog-chip-tacto'}
              onClick={() => setTipoFoto(id)}
            >
              {nombre()}
            </button>
          ))}
        </div>
        <label className="btn prog-btn-bloque" htmlFor="prog-input-foto">
          {t(`📷 Añadir foto de ${nombreTipoFoto(tipoFoto).toLowerCase()}`, `📷 Add ${nombreTipoFoto(tipoFoto).toLowerCase()} photo`)}
        </label>
        <input
          id="prog-input-foto"
          className="prog-oculto"
          type="file"
          accept="image/*"
          onChange={alElegirFoto}
        />
        <p className="texto-suave prog-nota">
          {t(
            'Dos fotos separadas por semanas cuentan más que cualquier número. Se quedan en tu dispositivo.',
            'Two photos weeks apart say more than any number. They stay on your device.'
          )}
        </p>
        {galeria.length > 0 ? (
          <div className="prog-fotos-grid">
            {galeria.map((f) => (
              <button key={f.id} className="prog-foto" onClick={() => abrirFoto(f)}>
                {urls[f.id] ? (
                  <img src={urls[f.id]} alt={t(`Foto de ${nombreTipoFoto(f.tipo).toLowerCase()} del ${formatearFecha(f.fecha)}`, `${nombreTipoFoto(f.tipo)} photo from ${formatearFecha(f.fecha)}`)} />
                ) : (
                  <span className="prog-foto-hueco">…</span>
                )}
                <span className="prog-foto-pie">{formatearFecha(f.fecha)} · {nombreTipoFoto(f.tipo)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="texto-suave prog-nota">{t('Aún no hay fotos. La primera es la que más vale: es el punto de partida.', 'No photos yet. The first one is worth the most: it is the starting point.')}</p>
        )}
      </div>

      {fotosAsc.length >= 2 && fotoA && fotoB && (
        <>
          <div className="titulo-seccion">{t('Comparador', 'Comparison')}</div>
          <div className="panel">
            <div className="grid-2">
              <div>
                <label className="etiqueta" htmlFor="prog-comp-a">{t('Antes', 'Before')}</label>
                <select id="prog-comp-a" className="input" value={fotoA.id} onChange={(e) => setCompA(e.target.value)}>
                  {fotosAsc.map((f) => (
                    <option key={f.id} value={f.id}>{formatearFecha(f.fecha)} · {nombreTipoFoto(f.tipo)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="etiqueta" htmlFor="prog-comp-b">{t('Después', 'After')}</label>
                <select id="prog-comp-b" className="input" value={fotoB.id} onChange={(e) => setCompB(e.target.value)}>
                  {fotosAsc.map((f) => (
                    <option key={f.id} value={f.id}>{formatearFecha(f.fecha)} · {nombreTipoFoto(f.tipo)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="prog-comparador">
              {[fotoA, fotoB].map((f, i) => (
                <div key={`${f.id}-${i}`}>
                  {urls[f.id] ? (
                    <img className="prog-comparador-img" src={urls[f.id]} alt={t(`Foto del ${formatearFecha(f.fecha)}`, `Photo from ${formatearFecha(f.fecha)}`)} />
                  ) : (
                    <div className="prog-foto-hueco">…</div>
                  )}
                  <div className="prog-foto-pie">{formatearFecha(f.fecha)} · {nombreTipoFoto(f.tipo)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {fotoAbierta && (
        <Modal
          titulo={`${nombreTipoFoto(fotoAbierta.tipo)} · ${formatearFecha(fotoAbierta.fecha)}`}
          abierto
          onCerrar={cerrarFoto}
        >
          {urls[fotoAbierta.id] ? (
            <img className="prog-foto-grande" src={urls[fotoAbierta.id]} alt={t('Foto de progreso', 'Progress photo')} />
          ) : (
            <div className="prog-foto-hueco">{t('Cargando…', 'Loading…')}</div>
          )}
          <div className="fila prog-acciones-modal">
            <button className="btn" onClick={cerrarFoto}>{t('Cerrar', 'Close')}</button>
            <button className="btn btn-peligro" onClick={alBorrarFoto}>
              {confirmaBorrado ? t('Toca otra vez para borrar', 'Tap again to delete') : t('Borrar', 'Delete')}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

function TabMetas({ estado, actualizarEstado, avisar }) {
  const [crear, setCrear] = useState(false)
  const [aBorrar, setABorrar] = useState(null)
  const [tipo, setTipo] = useState('marca')
  const [ejercicioId, setEjercicioId] = useState('')
  const [valorTxt, setValorTxt] = useState('')
  const [horizonte, setHorizonte] = useState('medio')

  const metas = estado.metas || []
  const activas = metas
    .filter((m) => !m.cumplidaEl)
    .map((m) => ({ m, st: estadoDeMeta(estado, m) }))
    .sort((a, b) => b.st.pct - a.st.pct)
  const cumplidas = metas.filter((m) => m.cumplidaEl).slice().reverse()
  const ejercicios = [...estado.ejercicios].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  function cerrarForm() {
    setCrear(false)
    setValorTxt('')
    setEjercicioId('')
  }

  function crearMeta() {
    const objetivo = Number(valorTxt.replace(',', '.'))
    if (!Number.isFinite(objetivo) || objetivo <= 0) {
      avisar(t('Pon un valor objetivo válido', 'Enter a valid target value'), 'error')
      return
    }
    let inicial = 0
    if (tipo === 'marca') {
      if (!ejercicioId) {
        avisar(t('Elige un ejercicio', 'Pick an exercise'), 'error')
        return
      }
      inicial = valorActualDeMeta(estado, { tipo: 'marca', ejercicioId }) || 0
      if (objetivo <= inicial) {
        avisar(t(`Ya estás en ${fmtNum(inicial)}: apunta más alto`, `You are already at ${fmtNum(inicial)}: aim higher`), 'error')
        return
      }
    } else if (tipo === 'peso') {
      const ref = pesoReferencia(estado)
      if (ref == null) {
        avisar(t('Registra tu peso al menos una vez primero (pestaña Cuerpo)', 'Log your weight at least once first (Body tab)'), 'error')
        return
      }
      if (objetivo === ref) {
        avisar(t('Ya estás ahí 😄', 'You are already there 😄'), 'error')
        return
      }
      inicial = ref
    } else {
      inicial = estado.progreso.contadores.sesionesTotales
      if (objetivo <= inicial) {
        avisar(t(`Ya llevas ${inicial} sesiones: apunta más alto`, `You already have ${inicial} sessions: aim higher`), 'error')
        return
      }
    }
    const meta = {
      id: `meta-${Date.now()}`,
      tipo,
      ejercicioId: tipo === 'marca' ? ejercicioId : undefined,
      objetivo,
      inicial,
      horizonte,
      creadaEl: claveDia(),
      cumplidaEl: null,
    }
    actualizarEstado((e) => ({ ...e, metas: [...(e.metas || []), meta] }))
    cerrarForm()
    avisar(t(`🎯 Meta en marcha: ${nombreDeMeta(estado, meta)}`, `🎯 Goal under way: ${nombreDeMeta(estado, meta)}`))
  }

  function borrarMeta(id) {
    actualizarEstado((e) => ({ ...e, metas: (e.metas || []).filter((m) => m.id !== id) }))
    setABorrar(null)
  }

  return (
    <>
      {activas.length === 0 && cumplidas.length === 0 && (
        <div className="panel prog-vacio">
          <p>{t('Sin metas todavía.', 'No goals yet.')}</p>
          <p className="texto-suave">
            {t(
              'Una meta se mide sola contra lo que ya registras: una marca en un ejercicio, tu peso, o un número de sesiones. Sin fechas límite: te espera.',
              'A goal measures itself against what you already log: a mark in an exercise, your weight, or a number of sessions. No deadlines: it waits for you.'
            )}
          </p>
        </div>
      )}
      {activas.map(({ m, st }) => (
        <div key={m.id} className="panel meta">
          <div className="meta-cab">
            {m.tipo === 'marca' && <MiniEjercicio id={m.ejercicioId} />}
            {m.tipo !== 'marca' && <div className="meta-emoji">{m.tipo === 'peso' ? '⚖️' : '⚔️'}</div>}
            <div className="meta-titular">
              <div className="meta-nombre">{nombreDeMeta(estado, m)}</div>
              <div className="texto-suave meta-detalle">
                {st.actual != null
                  ? t(
                      `${fmtNum(m.inicial)} → ${fmtNum(m.objetivo)} ${medidaDeMeta(estado, m)} · ahora: ${fmtNum(st.actual)}`,
                      `${fmtNum(m.inicial)} → ${fmtNum(m.objetivo)} ${medidaDeMeta(estado, m)} · now: ${fmtNum(st.actual)}`
                    )
                  : t('Aún sin datos: se medirá sola con tus registros', 'No data yet: it will measure itself from your logs')}
              </div>
            </div>
            <span className="meta-hz texto-suave">{nombreHorizonte(m.horizonte)}</span>
            <button className="rut-quitar" aria-label={t('Borrar meta', 'Delete goal')} onClick={() => setABorrar(m)}>✕</button>
          </div>
          <div className="meta-barra" role="img" aria-label={t(`${st.pct}% del camino`, `${st.pct}% of the path`)}>
            <div className="meta-barra-relleno" style={{ width: `${st.pct}%` }} />
          </div>
          <div className="texto-suave meta-pct">{t(`${st.pct}% del camino`, `${st.pct}% of the path`)}</div>
        </div>
      ))}
      <button className="btn btn-primario rut-boton-ancho" onClick={() => setCrear(true)}>
        {t('＋ Nueva meta', '＋ New goal')}
      </button>
      {cumplidas.length > 0 && (
        <>
          <h2 className="titulo-seccion">{t('Cumplidas', 'Fulfilled')}</h2>
          {cumplidas.map((m) => (
            <div key={m.id} className="panel meta-cumplida">
              <span className="meta-cumplida-icono">🎯</span>
              <div className="meta-titular">
                <div className="meta-nombre">{nombreDeMeta(estado, m)}</div>
                <div className="texto-suave meta-detalle">{t('Cumplida', 'Fulfilled')} · {formatearFecha(m.cumplidaEl)}</div>
              </div>
            </div>
          ))}
        </>
      )}
      <p className="texto-suave prog-nota">
        {t(
          'Las metas no dan XP ni tienen fecha límite: te esperan. La de peso corporal es información, como la báscula — se mide sobre tu media de 7 registros y aquí nada se pone en rojo.',
          'Goals grant no XP and carry no deadline: they wait for you. The body-weight one is information, like the scale — it is measured on your 7-entry average and nothing here turns red.'
        )}
      </p>
      {crear && (
        <Modal titulo={t('Nueva meta', 'New goal')} abierto onCerrar={cerrarForm}>
          <div className="meta-form">
            <label className="etiqueta">{t('Qué quieres medir', 'What you want to measure')}</label>
            <div className="rut-chips">
              {[
                ['marca', t('Marca en ejercicio', 'Exercise mark')],
                ['peso', t('Peso corporal', 'Body weight')],
                ['sesiones', t('Sesiones totales', 'Total sessions')],
              ].map(([id, nombre]) => (
                <button
                  key={id}
                  className={'chip' + (tipo === id ? ' chip-activo' : '')}
                  onClick={() => setTipo(id)}
                >
                  {nombre}
                </button>
              ))}
            </div>
            {tipo === 'marca' && (
              <>
                <label className="etiqueta" htmlFor="meta-ej">{t('Ejercicio', 'Exercise')}</label>
                <div className="meta-form-ej">
                  {ejercicioId && <MiniEjercicio id={ejercicioId} />}
                  <select
                    id="meta-ej"
                    className="input"
                    value={ejercicioId}
                    onChange={(ev) => setEjercicioId(ev.target.value)}
                  >
                    <option value="">{t('Elige un ejercicio…', 'Pick an exercise…')}</option>
                    {ejercicios.map((e) => (
                      <option key={e.id} value={e.id}>{nombreEjercicio(e)}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <label className="etiqueta" htmlFor="meta-valor">
              {tipo === 'peso'
                ? t('Peso objetivo (kg)', 'Target weight (kg)')
                : tipo === 'sesiones'
                  ? t('Sesiones totales objetivo', 'Target total sessions')
                  : t('Valor objetivo', 'Target value')}
            </label>
            <input
              id="meta-valor"
              className="input"
              type="text"
              inputMode="decimal"
              placeholder={tipo === 'sesiones' ? t('p. ej. 50', 'e.g. 50') : t('p. ej. 80', 'e.g. 80')}
              value={valorTxt}
              onChange={(ev) => setValorTxt(ev.target.value)}
            />
            <label className="etiqueta">{t('Horizonte', 'Horizon')}</label>
            <div className="rut-chips">
              {HORIZONTES.map(([id]) => (
                <button
                  key={id}
                  className={'chip' + (horizonte === id ? ' chip-activo' : '')}
                  onClick={() => setHorizonte(id)}
                >
                  {nombreHorizonte(id)}
                </button>
              ))}
            </div>
            <button className="btn btn-primario rut-boton-ancho" onClick={crearMeta}>
              {t('Forjar la meta', 'Forge the goal')}
            </button>
          </div>
        </Modal>
      )}
      {aBorrar && (
        <Modal titulo={t('Borrar meta', 'Delete goal')} abierto onCerrar={() => setABorrar(null)}>
          <p>
            {t(
              `¿Borrar «${nombreDeMeta(estado, aBorrar)}»? Solo desaparece la meta; tus datos no se tocan.`,
              `Delete “${nombreDeMeta(estado, aBorrar)}”? Only the goal disappears; your data stays untouched.`
            )}
          </p>
          <div className="fila rut-modal-botones">
            <button className="btn" onClick={() => setABorrar(null)}>{t('Cancelar', 'Cancel')}</button>
            <button className="btn btn-peligro" onClick={() => borrarMeta(aBorrar.id)}>{t('Borrar', 'Delete')}</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// Pistas de avance para logros contables: [llevas, de]. Transparencia > misterio.
const PISTAS_LOGRO = {
  diez_pruebas: (e) => [e.progreso.contadores.sesionesTotales, 10],
  veinticinco_batallas: (e) => [e.progreso.contadores.sesionesTotales, 25],
  cincuenta_gestas: (e) => [e.progreso.contadores.sesionesTotales, 50],
  cien_gestas: (e) => [e.progreso.contadores.sesionesTotales, 100],
  mas_fuerte: (e) => [e.progreso.contadores.prsTotales, 1],
  rompe_limites: (e) => [e.progreso.contadores.prsTotales, 10],
  pr_25: (e) => [e.progreso.contadores.prsTotales, 25],
  pr_50: (e) => [e.progreso.contadores.prsTotales, 50],
  imparable: (e) => [e.progreso.rachaMejor, 10],
  racha_25: (e) => [e.progreso.rachaMejor, 25],
  racha_50: (e) => [e.progreso.rachaMejor, 50],
  cronista: (e) => [diasDeAccion(e), 30],
  estacion_entera: (e) => [diasDeAccion(e), 90],
  vuelta_al_sol: (e) => [diasDeAccion(e), 365],
  diez_toneladas: (e) => [Math.round(volumenTotal(e)), 10000],
  cien_toneladas: (e) => [Math.round(volumenTotal(e)), 100000],
  arsenal: (e) => [ejerciciosDistintos(e), 15],
  maestro_armas: (e) => [ejerciciosDistintos(e), 30],
  cinco_metas: (e) => [(e.metas || []).filter((m) => m.cumplidaEl).length, 5],
}

function TabLogros({ estado }) {
  const conseguidos = estado.progreso.logros
  const total = LOGROS.length
  const cuantos = LOGROS.filter((l) => conseguidos[l.id]).length
  // Los forjados primero (por orden del catálogo), luego los que esperan.
  const ordenados = [...LOGROS.filter((l) => conseguidos[l.id]), ...LOGROS.filter((l) => !conseguidos[l.id])]

  return (
    <>
      <div className="panel logros-resumen">
        <div className="logros-resumen-num">{cuantos} <span className="texto-suave">{t('de', 'of')} {total}</span></div>
        <div className="logros-resumen-texto texto-suave">{t('logros forjados', 'achievements forged')}</div>
        <div className="meta-barra">
          <div className="meta-barra-relleno" style={{ width: `${Math.round((cuantos / total) * 100)}%` }} />
        </div>
      </div>
      <div className="prog-logros">
        {ordenados.map((l) => {
          const fecha = conseguidos[l.id]
          const pista = !fecha && PISTAS_LOGRO[l.id] ? PISTAS_LOGRO[l.id](estado) : null
          const avancePct = pista ? Math.min(100, Math.round((pista[0] / pista[1]) * 100)) : null
          return (
            <div key={l.id} className={fecha ? 'logro logro-si' : 'logro logro-no'}>
              <div className="logro-sello">{l.icono}</div>
              <div className="logro-nombre">{nombreLogro(l)}</div>
              <div className="logro-desc texto-suave">{descLogro(l)}</div>
              {fecha ? (
                <div className="logro-fecha">✓ {formatearFecha(fecha)}</div>
              ) : pista ? (
                <>
                  <div className="meta-barra logro-avance">
                    <div className="meta-barra-relleno" style={{ width: `${avancePct}%` }} />
                  </div>
                  <div className="logro-pista texto-suave">{fmtNum(pista[0])} / {fmtNum(pista[1])}</div>
                </>
              ) : (
                <div className="logro-pista texto-suave">{t('Te espera en el camino', 'It waits for you on the path')}</div>
              )}
              <div className="logro-xp">+{l.xp} XP</div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function TabDiario({ estado, actualizarEstado, avisar }) {
  const [abierta, setAbierta] = useState(null) // sesión en detalle
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)

  const sesiones = [...estado.sesiones].reverse()
  const nombreDe = (id) => {
    const ej = estado.ejercicios.find((x) => x.id === id)
    return ej ? nombreEjercicio(ej) : id
  }
  const volumenDe = (s) => {
    const medidaDe = new Map(estado.ejercicios.map((e) => [e.id, e.medida]))
    let kg = 0
    for (const ej of s.ejercicios) {
      if (medidaDe.get(ej.ejercicioId) !== 'peso_reps') continue
      for (const serie of ej.series) kg += serie.pesoKg * serie.reps
    }
    return kg
  }

  function borrar() {
    const id = abierta.id
    setConfirmarBorrado(false)
    setAbierta(null)
    actualizarEstado((e) => borrarSesion(e, id))
    avisar(t('Sesión borrada: su XP se descuenta, tus logros se quedan', 'Session deleted: its XP is deducted, your achievements remain'))
  }

  if (sesiones.length === 0) {
    return (
      <div className="panel prog-vacio">
        <p>{t('Tu diario está por escribir.', 'Your journal is yet to be written.')}</p>
        <p className="texto-suave">{t('Cada sesión que completes quedará aquí, con sus series y su XP.', 'Every session you complete will live here, with its sets and its XP.')}</p>
      </div>
    )
  }

  return (
    <div className="prog-diario">
      {sesiones.map((s) => {
        const nSeries = s.ejercicios.reduce((n, ej) => n + ej.series.length, 0)
        const kg = volumenDe(s)
        return (
          <button key={s.id} type="button" className="panel prog-sesion" onClick={() => setAbierta(s)}>
            <div className="prog-sesion-cab">
              <strong>{s.nombreDia}</strong>
              <span className="texto-suave">{formatearFecha(s.fecha)}</span>
            </div>
            <div className="texto-suave prog-sesion-meta">
              {nSeries} {nSeries === 1 ? t('serie', 'set') : t('series', 'sets')}
              {kg > 0 ? ` · ${fmtKg(kg)} kg` : ''}
              {` · +${s.xpGanado} XP`}
              {s.prs && s.prs.length > 0 ? ` · 🏅 ${s.prs.length} PR${s.prs.length > 1 ? 's' : ''}` : ''}
            </div>
          </button>
        )
      })}

      {abierta && (
        <Modal titulo={`${abierta.nombreDia} · ${formatearFecha(abierta.fecha)}`} abierto
          onCerrar={() => { setAbierta(null); setConfirmarBorrado(false) }}>
          <div className="prog-detalle">
            {abierta.ejercicios.map((ej, i) => (
              <div key={i} className="prog-detalle-ej">
                <MiniEjercicio chica id={ej.ejercicioId} />
                <div className="prog-detalle-ej-texto">
                  <strong>{nombreDe(ej.ejercicioId)}</strong>
                  <span className="texto-suave">
                    {ej.series.map((se) => (se.pesoKg > 0 ? `${fmtNum(se.pesoKg)}×${se.reps}` : String(se.reps))).join(' · ')}
                  </span>
                </div>
              </div>
            ))}
            <p className="texto-suave prog-detalle-xp">+{abierta.xpGanado} XP{abierta.duracionSeg > 0 ? ` · ${Math.round(abierta.duracionSeg / 60)} min` : ''}</p>
            {!confirmarBorrado ? (
              <button type="button" className="rut-borrar-enlace" onClick={() => setConfirmarBorrado(true)}>
                {t('Borrar esta sesión', 'Delete this session')}
              </button>
            ) : (
              <div className="fila aju-acciones-modal">
                <button type="button" className="btn" onClick={() => setConfirmarBorrado(false)}>{t('Conservar', 'Keep')}</button>
                <button type="button" className="btn btn-peligro" onClick={borrar}>
                  {t(`Borrar (−${abierta.xpGanado} XP)`, `Delete (−${abierta.xpGanado} XP)`)}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default function Progreso({ estado, actualizarEstado, aplicarEvento, avisar }) {
  const [pestana, setPestana] = useState('fuerza')

  return (
    <div className="vista">
      <h1 className="prog-titulo">{t('Progreso', 'Progress')}</h1>
      <div className="prog-pestanas" role="tablist" aria-label={t('Secciones de progreso', 'Progress sections')}>
        {PESTANAS.map(([id, nombre]) => (
          <button
            key={id}
            role="tab"
            aria-selected={pestana === id}
            className={pestana === id ? 'prog-pestana prog-pestana-activa' : 'prog-pestana'}
            onClick={() => setPestana(id)}
          >
            {nombre()}
          </button>
        ))}
      </div>
      {pestana === 'diario' && (
        <TabDiario estado={estado} actualizarEstado={actualizarEstado} avisar={avisar} />
      )}
      {pestana === 'fuerza' && <TabFuerza estado={estado} />}
      {pestana === 'volumen' && <TabVolumen estado={estado} />}
      {pestana === 'cuerpo' && (
        <TabCuerpo
          estado={estado}
          aplicarEvento={aplicarEvento}
          actualizarEstado={actualizarEstado}
          avisar={avisar}
        />
      )}
      {pestana === 'metas' && (
        <TabMetas estado={estado} actualizarEstado={actualizarEstado} avisar={avisar} />
      )}
      {pestana === 'logros' && <TabLogros estado={estado} />}
    </div>
  )
}
