import { useEffect, useRef, useState } from 'react'
import Modal from '../components/Modal.jsx'
import Stepper from '../components/Stepper.jsx'
import Temporizador, { desbloquearAudio } from '../components/Temporizador.jsx'
import { historicoEjercicio } from '../engine/motor.js'
import { claveDia, formatearFecha } from '../engine/fechas.js'
import { SelectorEjercicios } from './Rutinas.jsx'

function formatoKg(n) {
  return String(n).replace('.', ',')
}

function formatoDuracion(seg) {
  const m = Math.floor(seg / 60)
  const s = seg % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

// «Última vez»: 60 kg × 8 · 8 · 7 (mismo peso) o 60×8 · 62,5×6 (pesos mixtos)
function textoSeries(medida, series) {
  if (medida === 'tiempo') return series.map((s) => `${s.reps} min`).join(' · ')
  if (medida === 'reps') return series.map((s) => String(s.reps)).join(' · ')
  const mismoPeso = series.every((s) => s.pesoKg === series[0].pesoKg)
  if (mismoPeso) {
    return `${formatoKg(series[0].pesoKg)} kg × ${series.map((s) => s.reps).join(' · ')}`
  }
  return series.map((s) => `${formatoKg(s.pesoKg)}×${s.reps}`).join(' · ')
}

function textoMejor(medida, h) {
  if (medida === 'peso_reps') {
    if (h.mejorPesoKg == null) return null
    let t = `${formatoKg(h.mejorPesoKg)} kg`
    if (h.mejor1rmKg != null) t += ` · e1RM ${formatoKg(h.mejor1rmKg)} kg`
    return t
  }
  if (medida === 'reps') return h.mejorReps != null ? `${h.mejorReps} reps` : null
  return h.mejorMinutos != null ? `${h.mejorMinutos} min` : null
}

function objetivoDe(estado, sesion, ejercicioId) {
  if (!sesion.rutinaId) return null
  const rutina = estado.rutinas.find((r) => r.id === sesion.rutinaId)
  const dia = rutina ? rutina.dias.find((d) => d.id === sesion.diaId) : null
  if (!dia) return null
  return dia.ejercicios.find((x) => x.ejercicioId === ejercicioId) || null
}

// Prellenado: pesos/reps reales de la última vez; sin historial, el objetivo
// de la rutina; sin nada, valores razonables para empezar a ajustar.
function prellenarSeries(estado, ejercicioId, objetivo) {
  const ej = estado.ejercicios.find((x) => x.id === ejercicioId)
  const medida = ej ? ej.medida : 'peso_reps'
  const h = historicoEjercicio(estado, ejercicioId)
  const ultimas = h.ultimaVez && h.ultimaVez.series.length > 0 ? h.ultimaVez.series : null
  const total = objetivo ? objetivo.seriesObjetivo : ultimas ? ultimas.length : 3
  const series = []
  for (let i = 0; i < total; i += 1) {
    if (ultimas) {
      const base = ultimas[Math.min(i, ultimas.length - 1)]
      series.push({ pesoKg: base.pesoKg, reps: base.reps, hecha: false })
    } else if (objetivo) {
      series.push({
        pesoKg: medida === 'peso_reps' && objetivo.pesoObjetivoKg != null ? objetivo.pesoObjetivoKg : 0,
        reps: objetivo.repsObjetivo,
        hecha: false,
      })
    } else {
      series.push({ pesoKg: 0, reps: medida === 'tiempo' ? 10 : 8, hecha: false })
    }
  }
  return series
}

function Premio({ r }) {
  if (r.tipo === 'xp') {
    return <div className="ent-premio"><span>⭐</span><span>+{r.cantidad} XP · {r.motivo}</span></div>
  }
  if (r.tipo === 'pr') {
    return <div className="ent-premio ent-premio-pr"><span>🏅</span><span>¡PR en {r.nombre}! {r.detalle}</span></div>
  }
  if (r.tipo === 'logro') {
    return (
      <div className="ent-premio ent-premio-logro">
        <span>{r.logro.icono}</span>
        <span>
          Logro: {r.logro.nombre} (+{r.logro.xp} XP)
          <br />
          <small className="texto-suave">{r.logro.descripcion}</small>
        </span>
      </div>
    )
  }
  if (r.tipo === 'nivel') {
    return (
      <div className="ent-premio ent-premio-nivel">
        <span>⬆️</span>
        <span>
          ¡Nivel {r.nivel} · {r.etapa.nombre}!
          <br />
          <small className="texto-suave">{r.etapa.lema}</small>
        </span>
      </div>
    )
  }
  if (r.tipo === 'racha') {
    return <div className="ent-premio"><span>🔥</span><span>Racha: {r.dias} días planificados</span></div>
  }
  return null
}

function TarjetaEjercicio({ estado, sesion, ejS, iEj, alEditar, alMarcar, alAnadirSerie }) {
  const ej = estado.ejercicios.find((x) => x.id === ejS.ejercicioId) ||
    { id: ejS.ejercicioId, nombre: ejS.ejercicioId, medida: 'peso_reps' }
  const h = historicoEjercicio(estado, ejS.ejercicioId)
  const objetivo = objetivoDe(estado, sesion, ejS.ejercicioId)
  const mejor = textoMejor(ej.medida, h)

  return (
    <section className="panel ent-ejercicio">
      <header className="ent-ejercicio-cab">
        <h3 className="ent-ejercicio-nombre">{ej.nombre}</h3>
        {objetivo && (
          <span className="ent-objetivo">
            Objetivo {objetivo.seriesObjetivo}×{objetivo.repsObjetivo}
            {ej.medida === 'tiempo' ? ' min' : ''}
            {objetivo.pesoObjetivoKg != null ? ` · ${formatoKg(objetivo.pesoObjetivoKg)} kg` : ''}
          </span>
        )}
      </header>
      {h.ultimaVez ? (
        <p className="ent-ultima">
          <strong className="oro">Última vez</strong>
          {' '}
          <span className="texto-suave">({formatearFecha(h.ultimaVez.fecha)})</span>
          {': '}
          {textoSeries(ej.medida, h.ultimaVez.series)}
        </p>
      ) : (
        <p className="ent-ultima texto-suave">Primera vez con este ejercicio: hoy pones el listón.</p>
      )}
      {mejor && <p className="ent-mejor texto-suave">🏅 Mejor marca: {mejor}</p>}
      <div className="ent-series">
        {ejS.series.map((serie, iSerie) => (
          <div key={iSerie} className={'ent-serie' + (serie.hecha ? ' ent-serie-hecha' : '')}>
            <span className="ent-serie-num">{iSerie + 1}</span>
            <div className="ent-serie-steppers">
              {ej.medida === 'peso_reps' && (
                <Stepper
                  valor={serie.pesoKg}
                  paso={2.5}
                  min={0}
                  max={500}
                  unidad="kg"
                  onCambiar={(v) => alEditar(iEj, iSerie, { pesoKg: v })}
                  grande
                />
              )}
              {ej.medida === 'tiempo' ? (
                <Stepper
                  valor={serie.reps}
                  paso={1}
                  min={1}
                  max={300}
                  unidad="min"
                  onCambiar={(v) => alEditar(iEj, iSerie, { reps: v })}
                  grande
                />
              ) : (
                <Stepper
                  valor={serie.reps}
                  paso={1}
                  min={1}
                  max={100}
                  unidad="reps"
                  onCambiar={(v) => alEditar(iEj, iSerie, { reps: v })}
                  grande
                />
              )}
            </div>
            <button
              className={'ent-check' + (serie.hecha ? ' ent-check-hecha' : '')}
              onClick={() => alMarcar(iEj, iSerie)}
              aria-label={serie.hecha ? `Desmarcar serie ${iSerie + 1}` : `Marcar serie ${iSerie + 1} como hecha`}
            >
              ✓
            </button>
          </div>
        ))}
      </div>
      <button className="btn ent-btn-serie" onClick={() => alAnadirSerie(iEj)}>＋ Añadir serie</button>
    </section>
  )
}

export default function Entreno({ estado, actualizarEstado, aplicarEvento, irA, avisar }) {
  const [descanso, setDescanso] = useState(null)
  const [modal, setModal] = useState(null)
  const [recompensa, setRecompensa] = useState(null)
  const [ahora, setAhora] = useState(Date.now())
  const contadorDescanso = useRef(0)

  const sesion = estado.sesionActiva
  const haySesion = Boolean(sesion)

  useEffect(() => {
    if (!haySesion) return undefined
    const reloj = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(reloj)
  }, [haySesion])

  // Que la pantalla no se duerma durante la sesión (mejor esfuerzo, silencioso)
  useEffect(() => {
    if (!haySesion) return undefined
    let bloqueo = null
    let activo = true
    async function pedir() {
      try {
        bloqueo = await navigator.wakeLock?.request('screen')
      } catch {
        // sin wake lock la app funciona igual
      }
    }
    function alVolver() {
      if (activo && document.visibilityState === 'visible') pedir()
    }
    pedir()
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      activo = false
      document.removeEventListener('visibilitychange', alVolver)
      try {
        if (bloqueo) bloqueo.release().catch(() => {})
      } catch {
        // nada que liberar
      }
    }
  }, [haySesion])

  function editarSesion(fn) {
    actualizarEstado((e) => (e.sesionActiva ? { ...e, sesionActiva: fn(e.sesionActiva) } : e))
  }

  function empezarDia(rutina, dia) {
    actualizarEstado((e) => ({
      ...e,
      sesionActiva: {
        iniciadaEn: Date.now(),
        rutinaId: rutina.id,
        diaId: dia.id,
        nombreDia: dia.nombre || 'Entreno',
        ejercicios: dia.ejercicios.map((obj) => ({
          ejercicioId: obj.ejercicioId,
          series: prellenarSeries(e, obj.ejercicioId, obj),
        })),
      },
    }))
  }

  function empezarLibre() {
    actualizarEstado((e) => ({
      ...e,
      sesionActiva: {
        iniciadaEn: Date.now(),
        rutinaId: null,
        diaId: null,
        nombreDia: 'Entreno libre',
        ejercicios: [],
      },
    }))
  }

  function editarSerie(iEj, iSerie, cambio) {
    editarSesion((s) => ({
      ...s,
      ejercicios: s.ejercicios.map((ej, i) => (i !== iEj ? ej : {
        ...ej,
        series: ej.series.map((se, j) => (j !== iSerie ? se : { ...se, ...cambio })),
      })),
    }))
  }

  function marcarSerie(iEj, iSerie) {
    // Gesto de usuario: desbloquea el audio para que el aviso del descanso
    // pueda sonar en iOS aunque llegue 90 s más tarde.
    desbloquearAudio()
    const seraHecha = !sesion.ejercicios[iEj].series[iSerie].hecha
    editarSerie(iEj, iSerie, { hecha: seraHecha })
    if (seraHecha && estado.ajustes.descansoSeg > 0) {
      contadorDescanso.current += 1
      setDescanso({ id: contadorDescanso.current, seg: estado.ajustes.descansoSeg })
    }
  }

  function anadirSerie(iEj) {
    editarSesion((s) => ({
      ...s,
      ejercicios: s.ejercicios.map((ej, i) => {
        if (i !== iEj) return ej
        const ultima = ej.series[ej.series.length - 1]
        const nueva = ultima
          ? { pesoKg: ultima.pesoKg, reps: ultima.reps, hecha: false }
          : { pesoKg: 0, reps: 8, hecha: false }
        return { ...ej, series: [...ej.series, nueva] }
      }),
    }))
  }

  function anadirEjercicio(ej) {
    if (sesion.ejercicios.some((x) => x.ejercicioId === ej.id)) {
      avisar('Ese ejercicio ya está en la sesión')
      return
    }
    actualizarEstado((e) => {
      if (!e.sesionActiva) return e
      const objetivo = objetivoDe(e, e.sesionActiva, ej.id)
      return {
        ...e,
        sesionActiva: {
          ...e.sesionActiva,
          ejercicios: [
            ...e.sesionActiva.ejercicios,
            { ejercicioId: ej.id, series: prellenarSeries(e, ej.id, objetivo) },
          ],
        },
      }
    })
    setModal(null)
  }

  function terminar() {
    const s = sesion
    const seriesHechas = s.ejercicios.reduce(
      (n, ej) => n + ej.series.filter((x) => x.hecha).length, 0)
    if (seriesHechas === 0) {
      avisar('Marca al menos una serie con ✓ para completar la sesión')
      return
    }
    const hoy = claveDia()
    const duracionSeg = Math.max(1, Math.round((Date.now() - s.iniciadaEn) / 1000))
    const volumenKg = s.ejercicios.reduce(
      (tot, ej) => tot + ej.series.reduce((n, se) => n + (se.hecha ? se.pesoKg * se.reps : 0), 0), 0)
    const sesionEvento = {
      fecha: hoy,
      rutinaId: s.rutinaId,
      diaId: s.diaId,
      nombreDia: s.nombreDia,
      iniciadaEn: s.iniciadaEn,
      duracionSeg,
      ejercicios: s.ejercicios.map((ej) => ({
        ejercicioId: ej.ejercicioId,
        series: ej.series.map((se) => ({ pesoKg: se.pesoKg, reps: se.reps, hecha: se.hecha })),
      })),
    }
    const resultados = aplicarEvento({ tipo: 'sesion_completada', sesion: sesionEvento, hoy })
    actualizarEstado((e) => ({ ...e, sesionActiva: null }))
    setDescanso(null)
    setModal(null)
    setRecompensa({
      nombreDia: s.nombreDia,
      duracionSeg,
      seriesHechas,
      volumenKg,
      resultados,
    })
  }

  function descartar() {
    setDescanso(null)
    setModal(null)
    actualizarEstado((e) => ({ ...e, sesionActiva: null }))
    avisar('Sesión descartada. La próxima te espera.')
  }

  // ---------- Pantalla de recompensas (resumen tras terminar) ----------
  if (recompensa) {
    const xpTotal = recompensa.resultados.reduce((n, r) => {
      if (r.tipo === 'xp') return n + r.cantidad
      if (r.tipo === 'logro') return n + r.logro.xp
      return n
    }, 0)
    return (
      <div className="vista ent-recompensa">
        <div className="ent-recompensa-icono">🏆</div>
        <h1 className="ent-recompensa-titulo">¡Sesión completada!</h1>
        <p className="texto-suave">{recompensa.nombreDia}</p>
        <div className="ent-xp-total">+{xpTotal} XP</div>
        <div className="ent-resumen-grid">
          <div className="panel ent-resumen-dato">
            <span className="ent-resumen-cifra">{recompensa.seriesHechas}</span>
            <span className="texto-suave">series</span>
          </div>
          <div className="panel ent-resumen-dato">
            <span className="ent-resumen-cifra">{Math.round(recompensa.volumenKg).toLocaleString('es-ES')}</span>
            <span className="texto-suave">kg movidos</span>
          </div>
          <div className="panel ent-resumen-dato">
            <span className="ent-resumen-cifra">{formatoDuracion(recompensa.duracionSeg)}</span>
            <span className="texto-suave">duración</span>
          </div>
        </div>
        <div className="ent-premios">
          {recompensa.resultados.map((r, i) => <Premio key={i} r={r} />)}
        </div>
        <button
          className="btn btn-primario btn-grande"
          onClick={() => { setRecompensa(null); irA('home') }}
        >
          Volver al campamento
        </button>
      </div>
    )
  }

  // ---------- Selección de día (sin sesión activa) ----------
  if (!sesion) {
    return (
      <div className="vista">
        <h1 className="rut-titulo">⚔️ Entreno</h1>
        <p className="texto-suave rut-intro">Elige tu batalla de hoy.</p>
        {estado.rutinas.map((r) => (
          <section key={r.id} className="ent-rutina-bloque">
            <h2 className="titulo-seccion">{r.nombre || 'Rutina'}</h2>
            {r.dias.map((d) => (
              <button key={d.id} className="ent-dia-btn" onClick={() => empezarDia(r, d)}>
                <span className="ent-dia-nombre">{d.nombre || 'Día'}</span>
                <span className="texto-suave">
                  {d.ejercicios.length} ejercicio{d.ejercicios.length === 1 ? '' : 's'}
                </span>
              </button>
            ))}
            {r.dias.length === 0 && (
              <p className="texto-suave rut-vacio">Esta rutina aún no tiene días.</p>
            )}
          </section>
        ))}
        {estado.rutinas.length === 0 && (
          <div className="panel rut-vacio-panel">
            <p>Sin rutinas todavía.</p>
            <p className="texto-suave">Puedes entrenar libre ahora mismo o preparar tu plan en Rutinas.</p>
            <button className="btn rut-boton-ancho" onClick={() => irA('rutinas')}>📜 Crear una rutina</button>
          </div>
        )}
        <h2 className="titulo-seccion">Sin plan</h2>
        <button className="ent-dia-btn ent-dia-libre" onClick={empezarLibre}>
          <span className="ent-dia-nombre">🗡️ Entreno libre</span>
          <span className="texto-suave">añade ejercicios sobre la marcha</span>
        </button>
      </div>
    )
  }

  // ---------- Sesión activa ----------
  const duracion = Math.max(0, Math.round((ahora - sesion.iniciadaEn) / 1000))
  const seriesTotales = sesion.ejercicios.reduce((n, ej) => n + ej.series.length, 0)
  const seriesHechas = sesion.ejercicios.reduce(
    (n, ej) => n + ej.series.filter((x) => x.hecha).length, 0)

  return (
    <div className="vista">
      <header className="ent-cabecera">
        <div>
          <h1 className="ent-titulo">{sesion.nombreDia}</h1>
          <p className="texto-suave">⏱ {formatoDuracion(duracion)} · {seriesHechas}/{seriesTotales} series</p>
        </div>
      </header>
      {sesion.ejercicios.length === 0 && (
        <p className="texto-suave rut-vacio">El campo de batalla está listo. Añade tu primer ejercicio.</p>
      )}
      {sesion.ejercicios.map((ejS, iEj) => (
        <TarjetaEjercicio
          key={`${ejS.ejercicioId}-${iEj}`}
          estado={estado}
          sesion={sesion}
          ejS={ejS}
          iEj={iEj}
          alEditar={editarSerie}
          alMarcar={marcarSerie}
          alAnadirSerie={anadirSerie}
        />
      ))}
      <button className="btn ent-btn-anadir" onClick={() => setModal('anadir')}>＋ Añadir ejercicio</button>
      <button className="btn btn-primario btn-grande ent-btn-terminar" onClick={terminar}>
        🏁 Terminar entreno
      </button>
      <button className="btn btn-fantasma ent-btn-descartar" onClick={() => setModal('descartar')}>
        Descartar sesión
      </button>
      {descanso && <div className="ent-hueco-banner" />}
      {descanso && (
        <Temporizador
          key={descanso.id}
          segundos={descanso.seg}
          alCerrar={() => setDescanso(null)}
        />
      )}
      {modal === 'anadir' && (
        <Modal titulo="Añadir ejercicio" abierto onCerrar={() => setModal(null)}>
          <SelectorEjercicios ejercicios={estado.ejercicios} alElegir={anadirEjercicio} />
        </Modal>
      )}
      {modal === 'descartar' && (
        <Modal titulo="Descartar sesión" abierto onCerrar={() => setModal(null)}>
          <p>¿Descartar esta sesión? No se guardará nada ni contará para tu progreso.</p>
          <div className="fila rut-modal-botones">
            <button className="btn" onClick={() => setModal(null)}>Seguir entrenando</button>
            <button className="btn btn-peligro" onClick={descartar}>Descartar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
