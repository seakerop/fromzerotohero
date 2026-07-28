import { useEffect, useMemo, useRef, useState } from 'react'
import GraficaLinea from '../components/GraficaLinea.jsx'
import Modal from '../components/Modal.jsx'
import { claveDia, formatearFecha } from '../engine/fechas.js'
import { historicoEjercicio, pesosConMedia, progresoEjercicio, volumenSemanal } from '../engine/motor.js'
import { LOGROS } from '../data/logros.js'
import { guardarFoto, cargarFoto, borrarFoto } from '../db/fotos.js'

const PESTANAS = [
  ['fuerza', 'Fuerza'],
  ['volumen', 'Volumen'],
  ['cuerpo', 'Cuerpo'],
  ['logros', 'Logros'],
]

const TIPOS_FOTO = [
  ['frente', 'Frente'],
  ['lado', 'Lado'],
  ['espalda', 'Espalda'],
]

const ETIQUETAS_MEDIDAS = {
  cinturaCm: 'Cintura',
  pechoCm: 'Pecho',
  brazoCm: 'Brazo',
  musloCm: 'Muslo',
  caderaCm: 'Cadera',
}

function fmtNum(v) {
  const r = Math.round(v * 10) / 10
  return (Number.isInteger(r) ? String(r) : r.toFixed(1)).replace('.', ',')
}

function fmtKg(v) {
  if (v >= 10000) return `${Math.round(v / 1000)}k`
  if (v >= 1000) return `${(Math.round(v / 100) / 10).toFixed(1).replace('.', ',')}k`
  return String(Math.round(v))
}

function nombreTipoFoto(tipo) {
  const par = TIPOS_FOTO.find(([id]) => id === tipo)
  return par ? par[1] : tipo
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
  const elegido = conDatos.find((e) => e.id === elegidoId) || conDatos[0]

  if (!elegido) {
    return (
      <div className="panel prog-vacio">
        <p>Tu leyenda aún no tiene números.</p>
        <p className="texto-suave">Completa tu primer entreno y aquí verás crecer tu fuerza sesión a sesión.</p>
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
        nombre: 'Mejor peso',
        color: 'var(--oro)',
        puntos: datos.map((d) => ({ x: d.fecha, y: d.mejorPesoKg })),
      },
      {
        nombre: 'e1RM',
        color: 'var(--azul)',
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
        nombre: elegido.medida === 'tiempo' ? 'Mejores minutos' : 'Mejores reps',
        color: 'var(--oro)',
        puntos,
      },
    ]
  }

  return (
    <>
      <label className="etiqueta" htmlFor="prog-sel-ejercicio">Ejercicio</label>
      <select
        id="prog-sel-ejercicio"
        className="input"
        value={elegido.id}
        onChange={(e) => setElegidoId(e.target.value)}
      >
        {conDatos.map((e) => (
          <option key={e.id} value={e.id}>{e.nombre}</option>
        ))}
      </select>
      <div className="prog-resumen">
        <span className="chip">Sesiones: {h.vecesHecho}</span>
        {h.mejorPesoKg != null && <span className="chip">Mejor: {fmtNum(h.mejorPesoKg)} kg</span>}
        {h.mejor1rmKg != null && <span className="chip">e1RM: {fmtNum(h.mejor1rmKg)} kg</span>}
        {h.mejorReps != null && <span className="chip">Mejor: {h.mejorReps} reps</span>}
        {h.mejorMinutos != null && <span className="chip">Mejor: {h.mejorMinutos} min</span>}
      </div>
      <div className="panel prog-grafica">
        <GraficaLinea series={series} unidad={unidad} alto={190} />
      </div>
      <p className="texto-suave prog-nota">
        Cada punto es una sesión. La línea sube porque tú subes.
      </p>
    </>
  )
}

function TabVolumen({ estado }) {
  const semanas = volumenSemanal(estado).slice(-12)

  if (!semanas.length) {
    return (
      <div className="panel prog-vacio">
        <p>Todavía no has movido kilos que contar.</p>
        <p className="texto-suave">Cada serie con peso que completes sumará a esta gráfica.</p>
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
          aria-label="Volumen semanal en kilos"
        >
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
                  {`S${s.semana.split('-W')[1]}`}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="texto-suave prog-nota">
        Kilos movidos por semana: suma de peso × repeticiones de tus series con peso. Últimas 12 semanas.
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
      avisar('Escribe un peso válido en kg', 'error')
      return
    }
    const resultados = aplicarEvento({ tipo: 'peso', fecha: hoy, kg })
    if (!resultados.length) avisar('Peso del día actualizado')
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
      avisar('Añade al menos una medida', 'error')
      return
    }
    const resultados = aplicarEvento({ tipo: 'medidas', fecha: hoy, medidas })
    if (!resultados.length) avisar('Medidas guardadas')
    setMedidasTxt({ cinturaCm: '', pechoCm: '', brazoCm: '', musloCm: '', caderaCm: '' })
  }

  async function alElegirFoto(ev) {
    const fichero = ev.target.files && ev.target.files[0]
    ev.target.value = ''
    if (!fichero) return
    try {
      const id = await guardarFoto({ fecha: hoy, tipo: tipoFoto, blob: fichero })
      const resultados = aplicarEvento({ tipo: 'foto', fecha: hoy, fotoId: id, fotoTipo: tipoFoto })
      if (!resultados.length) avisar('Foto guardada')
    } catch {
      avisar('No se pudo guardar la foto', 'error')
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
    avisar('Foto borrada')
  }

  const seriesPeso = [
    {
      nombre: 'Registros',
      color: 'var(--texto-suave)',
      fino: true,
      puntos: datos.map((d) => ({ x: d.fecha, y: d.kg })),
    },
    {
      nombre: 'Media (7 registros)',
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
      <div className="titulo-seccion">Peso</div>
      <div className="panel">
        <GraficaLinea series={seriesPeso} unidad="kg" alto={190} />
        <p className="texto-suave prog-nota">
          La línea dorada es tu media de 7 registros; los puntos finos, el dato de cada día.
          Aquí tu peso es solo información: la app nunca lo puntúa.
        </p>
        <div className="fila prog-form-peso">
          <input
            className="input"
            type="text"
            inputMode="decimal"
            placeholder="p. ej. 92,4"
            aria-label="Peso de hoy en kilos"
            value={pesoTxt}
            onChange={(e) => setPesoTxt(e.target.value)}
          />
          <button className="btn btn-primario" onClick={guardarPeso}>Guardar</button>
        </div>
        {pesoHoy ? (
          <p className="texto-suave prog-nota">Hoy: {fmtNum(pesoHoy.kg)} kg registrados.</p>
        ) : ultimoPeso ? (
          <p className="texto-suave prog-nota">Último registro: {fmtNum(ultimoPeso.kg)} kg · {formatearFecha(ultimoPeso.fecha)}</p>
        ) : null}
      </div>

      <div className="titulo-seccion">Medidas</div>
      <div className="panel">
        <div className="grid-2 prog-medidas-form">
          {Object.entries(ETIQUETAS_MEDIDAS).map(([campo, etiqueta]) => (
            <div key={campo}>
              <label className="etiqueta" htmlFor={`prog-med-${campo}`}>{etiqueta} (cm)</label>
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
        <button className="btn btn-primario prog-btn-bloque" onClick={guardarMedidas}>Guardar medidas</button>
        {medidasRecientes.length > 0 && (
          <ul className="prog-medidas-lista">
            {medidasRecientes.map((m) => (
              <li key={m.fecha}>
                <span className="oro">{formatearFecha(m.fecha)}</span>{' '}
                {Object.entries(ETIQUETAS_MEDIDAS)
                  .filter(([campo]) => m[campo] != null)
                  .map(([campo, etiqueta]) => `${etiqueta} ${fmtNum(m[campo])}`)
                  .join(' · ')}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="titulo-seccion">Fotos de progreso</div>
      <div className="panel">
        <div className="fila prog-tipos-foto">
          {TIPOS_FOTO.map(([id, nombre]) => (
            <button
              key={id}
              className={tipoFoto === id ? 'chip chip-activo prog-chip-tacto' : 'chip prog-chip-tacto'}
              onClick={() => setTipoFoto(id)}
            >
              {nombre}
            </button>
          ))}
        </div>
        <label className="btn prog-btn-bloque" htmlFor="prog-input-foto">📷 Añadir foto de {nombreTipoFoto(tipoFoto).toLowerCase()}</label>
        <input
          id="prog-input-foto"
          className="prog-oculto"
          type="file"
          accept="image/*"
          onChange={alElegirFoto}
        />
        <p className="texto-suave prog-nota">
          Dos fotos separadas por semanas cuentan más que cualquier número. Se quedan en tu dispositivo.
        </p>
        {galeria.length > 0 ? (
          <div className="prog-fotos-grid">
            {galeria.map((f) => (
              <button key={f.id} className="prog-foto" onClick={() => abrirFoto(f)}>
                {urls[f.id] ? (
                  <img src={urls[f.id]} alt={`Foto de ${nombreTipoFoto(f.tipo).toLowerCase()} del ${formatearFecha(f.fecha)}`} />
                ) : (
                  <span className="prog-foto-hueco">…</span>
                )}
                <span className="prog-foto-pie">{formatearFecha(f.fecha)} · {nombreTipoFoto(f.tipo)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="texto-suave prog-nota">Aún no hay fotos. La primera es la que más vale: es el punto de partida.</p>
        )}
      </div>

      {fotosAsc.length >= 2 && fotoA && fotoB && (
        <>
          <div className="titulo-seccion">Comparador</div>
          <div className="panel">
            <div className="grid-2">
              <div>
                <label className="etiqueta" htmlFor="prog-comp-a">Antes</label>
                <select id="prog-comp-a" className="input" value={fotoA.id} onChange={(e) => setCompA(e.target.value)}>
                  {fotosAsc.map((f) => (
                    <option key={f.id} value={f.id}>{formatearFecha(f.fecha)} · {nombreTipoFoto(f.tipo)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="etiqueta" htmlFor="prog-comp-b">Después</label>
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
                    <img className="prog-comparador-img" src={urls[f.id]} alt={`Foto del ${formatearFecha(f.fecha)}`} />
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
            <img className="prog-foto-grande" src={urls[fotoAbierta.id]} alt="Foto de progreso" />
          ) : (
            <div className="prog-foto-hueco">Cargando…</div>
          )}
          <div className="fila prog-acciones-modal">
            <button className="btn" onClick={cerrarFoto}>Cerrar</button>
            <button className="btn btn-peligro" onClick={alBorrarFoto}>
              {confirmaBorrado ? 'Toca otra vez para borrar' : 'Borrar'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

function TabLogros({ estado }) {
  const conseguidos = estado.progreso.logros
  const total = LOGROS.length
  const cuantos = LOGROS.filter((l) => conseguidos[l.id]).length

  return (
    <>
      <p className="texto-suave prog-nota">
        {cuantos} de {total} conseguidos. Cada uno cuenta una parte de tu viaje.
      </p>
      <div className="prog-logros">
        {LOGROS.map((l) => {
          const fecha = conseguidos[l.id]
          return (
            <div key={l.id} className={fecha ? 'prog-logro prog-logro-si' : 'prog-logro prog-logro-no'}>
              <div className="prog-logro-icono">{l.icono}</div>
              <div className="prog-logro-nombre">{l.nombre}</div>
              <div className="prog-logro-detalle">
                {fecha ? `Conseguido · ${formatearFecha(fecha)}` : l.descripcion}
              </div>
              <div className="prog-logro-xp">+{l.xp} XP</div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default function Progreso({ estado, actualizarEstado, aplicarEvento, avisar }) {
  const [pestana, setPestana] = useState('fuerza')

  return (
    <div className="vista">
      <h1 className="prog-titulo">Progreso</h1>
      <div className="prog-pestanas" role="tablist" aria-label="Secciones de progreso">
        {PESTANAS.map(([id, nombre]) => (
          <button
            key={id}
            role="tab"
            aria-selected={pestana === id}
            className={pestana === id ? 'prog-pestana prog-pestana-activa' : 'prog-pestana'}
            onClick={() => setPestana(id)}
          >
            {nombre}
          </button>
        ))}
      </div>
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
      {pestana === 'logros' && <TabLogros estado={estado} />}
    </div>
  )
}
