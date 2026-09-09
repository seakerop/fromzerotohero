import { useEffect, useRef, useState } from 'react'
import Modal from '../components/Modal.jsx'
import EstadisticasEjercicio from '../components/EstadisticasEjercicio.jsx'
import { IconoProgreso } from '../components/Iconos.jsx'
import MiniEjercicio from '../components/MiniEjercicio.jsx'
import Stepper from '../components/Stepper.jsx'
import FichaEjercicio from '../components/FichaEjercicio.jsx'
import Temporizador, { desbloquearAudio } from '../components/Temporizador.jsx'
import { historicoEjercicio } from '../engine/motor.js'
import { claveDia, formatearFecha, sumarDias } from '../engine/fechas.js'
import { SelectorEjercicios } from './Rutinas.jsx'
import { idioma, localeNum, t } from '../i18n/idioma.js'
import { descLogro, lemaEtapa, nombreEjercicio, nombreEtapa, nombreLogro } from '../i18n/catalogo.js'

function formatoKg(n) {
  return idioma() === 'en' ? String(n) : String(n).replace('.', ',')
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
    let txt = `${formatoKg(h.mejorPesoKg)} kg`
    if (h.mejor1rmKg != null) txt += ` · e1RM ${formatoKg(h.mejor1rmKg)} kg`
    return txt
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

// Los motivos del xpLog son claves canónicas en español (dedup del motor):
// aquí solo se traducen en el punto de mostrarlos.
const MOTIVOS_EN = {
  'Sesión completada': 'Session completed',
  'Pasos registrados': 'Steps logged',
  'Pasos sobre tu base': 'Steps above your baseline',
  'Peso registrado': 'Weight logged',
  'Medidas registradas': 'Measurements logged',
  'Foto de progreso': 'Progress photo',
  'Semana perfecta': 'Perfect week',
}
function motivoTexto(motivo) {
  return idioma() === 'en' ? MOTIVOS_EN[motivo] || motivo : motivo
}

function Premio({ r }) {
  if (r.tipo === 'xp') {
    return <div className="ent-premio"><span>⭐</span><span>+{r.cantidad} XP · {motivoTexto(r.motivo)}</span></div>
  }
  if (r.tipo === 'pr') {
    const nombrePr = nombreEjercicio({ id: r.ejercicioId, nombre: r.nombre })
    const detallePr = idioma() === 'en' ? r.detalle.replace(',', '.') : r.detalle
    return (
      <div className="ent-premio ent-premio-pr">
        <span>🏅</span>
        <span>{t(`¡PR en ${nombrePr}! ${detallePr}`, `PR on ${nombrePr}! ${detallePr}`)}</span>
      </div>
    )
  }
  if (r.tipo === 'logro') {
    return (
      <div className="ent-premio ent-premio-logro">
        <span>{r.logro.icono}</span>
        <span>
          {t('Logro', 'Achievement')}: {nombreLogro(r.logro)} (+{r.logro.xp} XP)
          <br />
          <small className="texto-suave">{descLogro(r.logro)}</small>
        </span>
      </div>
    )
  }
  if (r.tipo === 'nivel') {
    return (
      <div className="ent-premio ent-premio-nivel">
        <span>⬆️</span>
        <span>
          {t(`¡Nivel ${r.nivel} · ${nombreEtapa(r.etapa)}!`, `Level ${r.nivel} · ${nombreEtapa(r.etapa)}!`)}
          <br />
          <small className="texto-suave">{lemaEtapa(r.etapa)}</small>
        </span>
      </div>
    )
  }
  if (r.tipo === 'racha') {
    return <div className="ent-premio"><span>🔥</span><span>{t(`Racha: ${r.dias} días planificados`, `Streak: ${r.dias} planned days`)}</span></div>
  }
  return null
}

function TarjetaEjercicio({ estado, sesion, ejS, iEj, total, alEditar, alMarcar, alAnadirSerie, alMover, alQuitar }) {
  const [verFicha, setVerFicha] = useState(false)
  const [verStats, setVerStats] = useState(false)
  const ej = estado.ejercicios.find((x) => x.id === ejS.ejercicioId) ||
    { id: ejS.ejercicioId, nombre: ejS.ejercicioId, medida: 'peso_reps' }
  const h = historicoEjercicio(estado, ejS.ejercicioId)
  const mejor = textoMejor(ej.medida, h)
  const nombreEj = nombreEjercicio(ej)

  return (
    <section className="panel ent-ejercicio">
      <FichaEjercicio ejercicio={ej} abierto={verFicha} onCerrar={() => setVerFicha(false)} />
      <EstadisticasEjercicio estado={estado} ejercicio={ej} abierto={verStats} onCerrar={() => setVerStats(false)} />
      <header className="ent-ejercicio-cab">
        <MiniEjercicio id={ej.id} />
        <h3 className="ent-ejercicio-nombre">{nombreEj}</h3>
        <span className="rut-ejercicio-acciones ent-acciones">
          <button
            className="rut-info"
            aria-label={t(`Ver técnica de ${nombreEj}`, `View technique for ${nombreEj}`)}
            onClick={() => setVerFicha(true)}
          >
            ⓘ
          </button>
          <button
            className="rut-info"
            aria-label={t(`Ver mis estadísticas de ${nombreEj}`, `View my stats for ${nombreEj}`)}
            onClick={() => setVerStats(true)}
          >
            <IconoProgreso tam={17} />
          </button>
          <button
            type="button"
            className="ent-mover-btn"
            disabled={iEj === 0}
            onClick={() => alMover(iEj, -1)}
            aria-label={t(`Subir ${nombreEj}`, `Move ${nombreEj} up`)}
          >
            ↑
          </button>
          <button
            type="button"
            className="ent-mover-btn"
            disabled={iEj === total - 1}
            onClick={() => alMover(iEj, 1)}
            aria-label={t(`Bajar ${nombreEj}`, `Move ${nombreEj} down`)}
          >
            ↓
          </button>
          <button
            className="rut-quitar"
            aria-label={t(`Quitar ${nombreEj} de la sesión`, `Remove ${nombreEj} from the session`)}
            onClick={() => alQuitar(iEj)}
          >
            ✕
          </button>
        </span>
      </header>
      {h.ultimaVez ? (
        <p className="ent-ultima">
          <strong className="oro">{t('Última vez', 'Last time')}</strong>
          {' '}
          <span className="texto-suave">({formatearFecha(h.ultimaVez.fecha)})</span>
          {': '}
          {textoSeries(ej.medida, h.ultimaVez.series)}
        </p>
      ) : (
        <p className="ent-ultima texto-suave">{t('Primera vez con este ejercicio: hoy pones el listón.', 'First time with this exercise: today you set the bar.')}</p>
      )}
      {mejor && <p className="ent-mejor texto-suave">🏅 {t('Mejor marca', 'Best mark')}: {mejor}</p>}
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
              aria-label={serie.hecha
                ? t(`Desmarcar serie ${iSerie + 1}`, `Unmark set ${iSerie + 1}`)
                : t(`Marcar serie ${iSerie + 1} como hecha`, `Mark set ${iSerie + 1} as done`)}
            >
              ✓
            </button>
          </div>
        ))}
      </div>
      <button className="btn ent-btn-serie" onClick={() => alAnadirSerie(iEj)}>＋ {t('Añadir serie', 'Add set')}</button>
    </section>
  )
}

export default function Entreno({ estado, actualizarEstado, aplicarEvento, irA, avisar }) {
  const [descanso, setDescanso] = useState(null)
  const [modal, setModal] = useState(null)
  const [recompensa, setRecompensa] = useState(null)
  const [ahora, setAhora] = useState(Date.now())
  const [modoAyer, setModoAyer] = useState(false)
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

  // Si "es de ayer", la sesión se guarda con la fecha de ayer (corte 04:00):
  // registrar a posteriori el entreno olvidado protege la racha sin trucos.
  const fechaAtras = () => (modoAyer ? sumarDias(claveDia(), -1) : null)

  function empezarDia(rutina, dia) {
    const fechaObjetivo = fechaAtras()
    actualizarEstado((e) => ({
      ...e,
      sesionActiva: {
        iniciadaEn: Date.now(),
        fechaObjetivo,
        rutinaId: rutina.id,
        diaId: dia.id,
        nombreDia: dia.nombre || t('Entreno', 'Workout'),
        ejercicios: dia.ejercicios.map((obj) => ({
          ejercicioId: obj.ejercicioId,
          series: prellenarSeries(e, obj.ejercicioId, obj),
        })),
      },
    }))
    setModoAyer(false)
  }

  function empezarLibre() {
    const fechaObjetivo = fechaAtras()
    actualizarEstado((e) => ({
      ...e,
      sesionActiva: {
        iniciadaEn: Date.now(),
        fechaObjetivo,
        rutinaId: null,
        diaId: null,
        nombreDia: t('Entreno libre', 'Free workout'),
        ejercicios: [],
      },
    }))
    setModoAyer(false)
  }

  function moverEjercicio(iEj, dir) {
    editarSesion((s) => {
      const j = iEj + dir
      if (j < 0 || j >= s.ejercicios.length) return s
      const lista = [...s.ejercicios]
      ;[lista[iEj], lista[j]] = [lista[j], lista[iEj]]
      return { ...s, ejercicios: lista }
    })
  }

  function quitarEjercicio(iEj) {
    editarSesion((s) => ({ ...s, ejercicios: s.ejercicios.filter((_, i) => i !== iEj) }))
    setModal(null)
    avisar(t('Ejercicio quitado de la sesión', 'Exercise removed from the session'))
  }

  // Sin series marcadas se quita al toque; con series ✓ pide confirmación
  // porque se perderían al quitarlo.
  function pedirQuitar(iEj) {
    const tieneHechas = sesion.ejercicios[iEj].series.some((se) => se.hecha)
    if (tieneHechas) setModal({ tipo: 'quitar', iEj })
    else quitarEjercicio(iEj)
  }

  function editarSerie(iEj, iSerie, cambio) {
    editarSesion((s) => ({
      ...s,
      ejercicios: s.ejercicios.map((ej, i) => {
        if (i !== iEj) return ej
        // Cascada de peso: al cambiar una serie, las de DEBAJO que sigan
        // «intactas» (a 0 o con el mismo peso que tenía esta) la acompañan.
        // Nunca toca series ya marcadas ✓ ni valores distintos puestos a mano.
        const pesoAnterior = ej.series[iSerie].pesoKg
        const cascada = cambio.pesoKg != null
        return {
          ...ej,
          series: ej.series.map((se, j) => {
            if (j === iSerie) return { ...se, ...cambio }
            if (cascada && j > iSerie && !se.hecha && (se.pesoKg === 0 || se.pesoKg === pesoAnterior)) {
              return { ...se, pesoKg: cambio.pesoKg }
            }
            return se
          }),
        }
      }),
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
      avisar(t('Ese ejercicio ya está en la sesión', 'That exercise is already in the session'))
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
      avisar(t('Marca al menos una serie con ✓ para completar la sesión', 'Mark at least one set with ✓ to complete the session'))
      return
    }
    const hoy = s.fechaObjetivo || claveDia()
    // Una sesión registrada a posteriori no tiene duración real que contar.
    const duracionSeg = s.fechaObjetivo ? 0 : Math.max(1, Math.round((Date.now() - s.iniciadaEn) / 1000))
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
    avisar(t('Sesión descartada. La próxima te espera.', 'Session discarded. The next one awaits.'))
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
        <h1 className="ent-recompensa-titulo">{t('¡Sesión completada!', 'Session complete!')}</h1>
        <p className="texto-suave">{recompensa.nombreDia}</p>
        <div className="ent-xp-total">+{xpTotal} XP</div>
        <div className="ent-resumen-grid">
          <div className="panel ent-resumen-dato">
            <span className="ent-resumen-cifra">{recompensa.seriesHechas}</span>
            <span className="texto-suave">{t('series', 'sets')}</span>
          </div>
          <div className="panel ent-resumen-dato">
            <span className="ent-resumen-cifra">{Math.round(recompensa.volumenKg).toLocaleString(localeNum())}</span>
            <span className="texto-suave">{t('kg movidos', 'kg moved')}</span>
          </div>
          <div className="panel ent-resumen-dato">
            <span className="ent-resumen-cifra">{formatoDuracion(recompensa.duracionSeg)}</span>
            <span className="texto-suave">{t('duración', 'duration')}</span>
          </div>
        </div>
        <div className="ent-premios">
          {recompensa.resultados.map((r, i) => <Premio key={i} r={r} />)}
        </div>
        <button
          className="btn btn-primario btn-grande"
          onClick={() => { setRecompensa(null); irA('home') }}
        >
          {t('Volver al campamento', 'Back to camp')}
        </button>
      </div>
    )
  }

  // ---------- Selección de día (sin sesión activa) ----------
  if (!sesion) {
    return (
      <div className="vista">
        <h1 className="rut-titulo">⚔️ {t('Entreno', 'Workout')}</h1>
        <p className="texto-suave rut-intro">{t('Elige tu batalla de hoy.', 'Choose your battle for today.')}</p>
        <button
          type="button"
          className={modoAyer ? 'chip chip-activo ent-chip-ayer' : 'chip ent-chip-ayer'}
          onClick={() => setModoAyer(!modoAyer)}
          aria-pressed={modoAyer}
        >
          🕰 {t('Es de ayer (se me olvidó apuntarlo)', 'It was yesterday (I forgot to log it)')}
        </button>
        {modoAyer && (
          <p className="texto-suave ent-ayer-nota">
            {t('El entreno se guardará con fecha de ayer y contará para tu racha.', "The workout will be saved with yesterday's date and count toward your streak.")}
          </p>
        )}
        {estado.rutinas.map((r) => (
          <section key={r.id} className="ent-rutina-bloque">
            <h2 className="titulo-seccion">{r.nombre || t('Rutina', 'Routine')}</h2>
            {r.dias.map((d) => (
              <button key={d.id} className="ent-dia-btn" onClick={() => empezarDia(r, d)}>
                <span className="ent-dia-nombre">{d.nombre || t('Día', 'Day')}</span>
                <span className="texto-suave">
                  {d.ejercicios.length} {d.ejercicios.length === 1 ? t('ejercicio', 'exercise') : t('ejercicios', 'exercises')}
                </span>
              </button>
            ))}
            {r.dias.length === 0 && (
              <p className="texto-suave rut-vacio">{t('Esta rutina aún no tiene días.', 'This routine has no days yet.')}</p>
            )}
          </section>
        ))}
        {estado.rutinas.length === 0 && (
          <div className="panel rut-vacio-panel">
            <p>{t('Sin rutinas todavía.', 'No routines yet.')}</p>
            <p className="texto-suave">{t('Puedes entrenar libre ahora mismo o preparar tu plan en Rutinas.', 'You can train free right now or shape your plan in Routines.')}</p>
            <button className="btn rut-boton-ancho" onClick={() => irA('rutinas')}>📜 {t('Crear una rutina', 'Create a routine')}</button>
          </div>
        )}
        <h2 className="titulo-seccion">{t('Sin plan', 'No plan')}</h2>
        <button className="ent-dia-btn ent-dia-libre" onClick={empezarLibre}>
          <span className="ent-dia-nombre">🗡️ {t('Entreno libre', 'Free workout')}</span>
          <span className="texto-suave">{t('añade ejercicios sobre la marcha', 'add exercises as you go')}</span>
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
          <p className="texto-suave">⏱ {formatoDuracion(duracion)} · {seriesHechas}/{seriesTotales} {t('series', 'sets')}</p>
        </div>
      </header>
      {sesion.fechaObjetivo && (
        <p className="ent-ayer-banner">
          {idioma() === 'en' ? (
            <>🕰 Logging <strong>yesterday&apos;s</strong> workout ({formatearFecha(sesion.fechaObjetivo)}): note what you did and save.</>
          ) : (
            <>🕰 Registrando el entreno de <strong>ayer</strong> ({formatearFecha(sesion.fechaObjetivo)}): apunta lo que hiciste y guarda.</>
          )}
        </p>
      )}
      {sesion.ejercicios.length === 0 && (
        <p className="texto-suave rut-vacio">{t('El campo de batalla está listo. Añade tu primer ejercicio.', 'The battlefield is ready. Add your first exercise.')}</p>
      )}
      {sesion.ejercicios.map((ejS, iEj) => (
        <TarjetaEjercicio
          key={`${ejS.ejercicioId}-${iEj}`}
          estado={estado}
          sesion={sesion}
          ejS={ejS}
          iEj={iEj}
          total={sesion.ejercicios.length}
          alEditar={editarSerie}
          alMarcar={marcarSerie}
          alAnadirSerie={anadirSerie}
          alMover={moverEjercicio}
          alQuitar={pedirQuitar}
        />
      ))}
      <button className="btn ent-btn-anadir" onClick={() => setModal('anadir')}>＋ {t('Añadir ejercicio', 'Add exercise')}</button>
      <button
        className="btn btn-primario btn-grande ent-btn-terminar"
        onClick={() => {
          if (seriesHechas === 0) {
            avisar(t('Marca al menos una serie con ✓ para completar la sesión', 'Mark at least one set with ✓ to complete the session'))
            return
          }
          setModal('fin')
        }}
      >
        🏁 {t('Terminar entreno', 'Finish workout')}
      </button>
      <button className="btn btn-fantasma ent-btn-descartar" onClick={() => setModal('descartar')}>
        {t('Descartar sesión', 'Discard session')}
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
        <Modal titulo={t('Añadir ejercicio', 'Add exercise')} abierto onCerrar={() => setModal(null)}>
          <SelectorEjercicios estado={estado} ejercicios={estado.ejercicios} alElegir={anadirEjercicio} />
        </Modal>
      )}
      {modal && modal.tipo === 'quitar' && sesion.ejercicios[modal.iEj] && (
        <Modal titulo={t('Quitar ejercicio', 'Remove exercise')} abierto onCerrar={() => setModal(null)}>
          <p>
            {t(
              'Este ejercicio tiene series marcadas con ✓. Si lo quitas de la sesión, se pierden. ¿Lo quitas igualmente?',
              'This exercise has sets marked with ✓. If you remove it from the session, they are lost. Remove it anyway?'
            )}
          </p>
          <div className="fila rut-modal-botones">
            <button className="btn" onClick={() => setModal(null)}>{t('Cancelar', 'Cancel')}</button>
            <button className="btn btn-peligro" onClick={() => quitarEjercicio(modal.iEj)}>{t('Quitar', 'Remove')}</button>
          </div>
        </Modal>
      )}
      {modal === 'descartar' && (
        <Modal titulo={t('Descartar sesión', 'Discard session')} abierto onCerrar={() => setModal(null)}>
          <p>{t('¿Descartar esta sesión? No se guardará nada ni contará para tu progreso.', 'Discard this session? Nothing will be saved and it will not count toward your progress.')}</p>
          <div className="fila rut-modal-botones">
            <button className="btn" onClick={() => setModal(null)}>{t('Seguir entrenando', 'Keep training')}</button>
            <button className="btn btn-peligro" onClick={descartar}>{t('Descartar', 'Discard')}</button>
          </div>
        </Modal>
      )}
      {modal === 'fin' && (
        <Modal titulo={t('Terminar entreno', 'Finish workout')} abierto onCerrar={() => setModal(null)}>
          <p>
            {t('Vas a guardar ', "You're about to save ")}<strong>{seriesHechas}</strong> {seriesHechas === 1 ? t('serie', 'set') : t('series', 'sets')}
            {seriesTotales > seriesHechas
              ? t(` (las ${seriesTotales - seriesHechas} sin ✓ se descartan)`, ` (the ${seriesTotales - seriesHechas} without ✓ are discarded)`)
              : ''}
            {sesion.fechaObjetivo ? t(' con fecha de ayer', ' dated yesterday') : ''}.
          </p>
          <div className="fila rut-modal-botones">
            <button className="btn" onClick={() => setModal(null)}>{t('Seguir entrenando', 'Keep training')}</button>
            <button className="btn btn-primario" onClick={terminar}>{t('Guardar sesión', 'Save session')}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
