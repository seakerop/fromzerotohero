import { useMemo, useState } from 'react'
import EstadisticasEjercicio from '../components/EstadisticasEjercicio.jsx'
import FichaEjercicio from '../components/FichaEjercicio.jsx'
import { IconoProgreso } from '../components/Iconos.jsx'
import MiniEjercicio from '../components/MiniEjercicio.jsx'
import Modal from '../components/Modal.jsx'
import Stepper from '../components/Stepper.jsx'
import { EQUIPAMIENTO, GRUPOS } from '../data/ejercicios.js'
import { EQUIPOS, plantillasFiltradas } from '../data/plantillas-rutinas.js'
import { t } from '../i18n/idioma.js'
import {
  guiaNovato,
  nombreEjercicio,
  nombreEquipamiento,
  nombreEquipoPlantilla,
  nombreGrupo as nombreGrupoCatalogo,
  nombreDiaPlantilla,
  plantillaTexto,
} from '../i18n/catalogo.js'

// El mapa de medidas se resuelve en cada render para que cambie con el idioma.
function nombreMedida(medida) {
  if (medida === 'peso_reps') return t('peso × reps', 'weight × reps')
  if (medida === 'reps') return t('solo reps', 'reps only')
  if (medida === 'tiempo') return t('tiempo (min)', 'time (min)')
  return medida
}

function nuevoId(prefijo) {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function idUnico(nombre, ejercicios) {
  const base = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'ejercicio'
  let id = base
  let n = 2
  while (ejercicios.some((e) => e.id === id)) {
    id = `${base}-${n}`
    n += 1
  }
  return id
}

export function nombreGrupo(grupoId) {
  return nombreGrupoCatalogo(grupoId)
}


// Buscador de biblioteca con filtro por grupo. Lo reutiliza Entreno para
// añadir ejercicios sobre la marcha (por eso va exportado).
export function SelectorEjercicios({ ejercicios, alElegir, alBorrar, estado }) {
  const [busqueda, setBusqueda] = useState('')
  const [grupo, setGrupo] = useState('todos')
  const [equipo, setEquipo] = useState('todos')
  const [ficha, setFicha] = useState(null)
  const [stats, setStats] = useState(null)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return ejercicios.filter((ej) => {
      if (grupo !== 'todos' && ej.grupo !== grupo) return false
      // Sin equipo declarado (personalizados antiguos) pasa cualquier filtro.
      if (equipo !== 'todos' && ej.equipo && ej.equipo !== equipo) return false
      if (q && !ej.nombre.toLowerCase().includes(q) && !nombreEjercicio(ej).toLowerCase().includes(q)) return false
      return true
    })
  }, [ejercicios, busqueda, grupo, equipo])

  const Cuerpo = alElegir ? 'button' : 'div'

  return (
    <div className="rut-picker">
      <input
        className="input"
        type="search"
        placeholder={t('Buscar ejercicio…', 'Search exercises…')}
        value={busqueda}
        onChange={(ev) => setBusqueda(ev.target.value)}
        aria-label={t('Buscar ejercicio', 'Search exercises')}
      />
      <div className="rut-chips">
        <button
          className={'chip' + (grupo === 'todos' ? ' chip-activo' : '')}
          onClick={() => setGrupo('todos')}
        >
          {t('Todos', 'All')}
        </button>
        {GRUPOS.map((g) => (
          <button
            key={g.id}
            className={'chip' + (grupo === g.id ? ' chip-activo' : '')}
            onClick={() => setGrupo(g.id)}
          >
            {nombreGrupo(g.id)}
          </button>
        ))}
      </div>
      <div className="rut-chips">
        <button
          className={'chip' + (equipo === 'todos' ? ' chip-activo' : '')}
          onClick={() => setEquipo('todos')}
        >
          {t('Todo el material', 'All equipment')}
        </button>
        {EQUIPAMIENTO.map((eq) => (
          <button
            key={eq.id}
            className={'chip' + (equipo === eq.id ? ' chip-activo' : '')}
            onClick={() => setEquipo(eq.id)}
          >
            {nombreEquipamiento(eq.id)}
          </button>
        ))}
      </div>
      <div className="rut-picker-lista">
        {filtrados.map((ej) => (
          <div className="rut-picker-item" key={ej.id}>
            <MiniEjercicio id={ej.id} />
            <Cuerpo
              className="rut-picker-elegir"
              onClick={alElegir ? () => alElegir(ej) : undefined}
            >
              <span className="rut-picker-nombre">{nombreEjercicio(ej)}{ej.personalizado ? ' ✦' : ''}</span>
              <span className="texto-suave rut-picker-meta">
                {nombreGrupo(ej.grupo)} · {nombreMedida(ej.medida)}
              </span>
            </Cuerpo>
            <button
              className="rut-info"
              aria-label={t(`Ver técnica de ${nombreEjercicio(ej)}`, `View technique for ${nombreEjercicio(ej)}`)}
              onClick={() => setFicha(ej)}
            >
              ⓘ
            </button>
            {estado && (
              <button
                className="rut-info"
                aria-label={t(`Ver mis estadísticas de ${nombreEjercicio(ej)}`, `View my stats for ${nombreEjercicio(ej)}`)}
                onClick={() => setStats(ej)}
              >
                <IconoProgreso tam={17} />
              </button>
            )}
            {alBorrar && ej.personalizado && (
              <button
                className="rut-quitar"
                aria-label={t(`Borrar ${nombreEjercicio(ej)}`, `Delete ${nombreEjercicio(ej)}`)}
                onClick={() => alBorrar(ej)}
              >
                🗑
              </button>
            )}
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="texto-suave rut-vacio">{t('Ningún ejercicio encaja con la búsqueda.', 'No exercise matches your search.')}</p>
        )}
      </div>
      <FichaEjercicio ejercicio={ficha} abierto={Boolean(ficha)} onCerrar={() => setFicha(null)} />
      {estado && (
        <EstadisticasEjercicio estado={estado} ejercicio={stats} abierto={Boolean(stats)} onCerrar={() => setStats(null)} />
      )}
    </div>
  )
}

function FormNuevoEjercicio({ alCrear }) {
  const [nombre, setNombre] = useState('')
  const [grupo, setGrupo] = useState(GRUPOS[0].id)
  const [medida, setMedida] = useState('peso_reps')
  const [equipo, setEquipo] = useState('mancuerna')

  return (
    <div className="rut-form">
      <label className="etiqueta" htmlFor="rut-nuevo-nombre">{t('Nombre', 'Name')}</label>
      <input
        id="rut-nuevo-nombre"
        className="input"
        value={nombre}
        onChange={(ev) => setNombre(ev.target.value)}
        placeholder={t('Press Arnold', 'Arnold press')}
      />
      <label className="etiqueta" htmlFor="rut-nuevo-grupo">{t('Grupo muscular', 'Muscle group')}</label>
      <select
        id="rut-nuevo-grupo"
        className="input"
        value={grupo}
        onChange={(ev) => setGrupo(ev.target.value)}
      >
        {GRUPOS.map((g) => (
          <option key={g.id} value={g.id}>{nombreGrupo(g.id)}</option>
        ))}
      </select>
      <label className="etiqueta" htmlFor="rut-nueva-medida">{t('Cómo se mide', 'How it is measured')}</label>
      <select
        id="rut-nueva-medida"
        className="input"
        value={medida}
        onChange={(ev) => setMedida(ev.target.value)}
      >
        <option value="peso_reps">{t('Peso × repeticiones', 'Weight × repetitions')}</option>
        <option value="reps">{t('Solo repeticiones', 'Repetitions only')}</option>
        <option value="tiempo">{t('Tiempo (minutos)', 'Time (minutes)')}</option>
      </select>
      <label className="etiqueta" htmlFor="rut-nuevo-equipo">{t('Material', 'Equipment')}</label>
      <select
        id="rut-nuevo-equipo"
        className="input"
        value={equipo}
        onChange={(ev) => setEquipo(ev.target.value)}
      >
        {EQUIPAMIENTO.map((eq) => (
          <option key={eq.id} value={eq.id}>{nombreEquipamiento(eq.id)}</option>
        ))}
      </select>
      <button className="btn btn-primario rut-boton-ancho" onClick={() => alCrear({ nombre, grupo, medida, equipo })}>
        {t('Añadir a la biblioteca', 'Add to the library')}
      </button>
    </div>
  )
}

export default function Rutinas({ estado, actualizarEstado, avisar }) {
  const [rutinaId, setRutinaId] = useState(null)
  const [diaId, setDiaId] = useState(null)
  const [verBiblioteca, setVerBiblioteca] = useState(false)
  const [verPlantillas, setVerPlantillas] = useState(false)
  const [equipoFiltro, setEquipoFiltro] = useState('gym')
  const [fichaDia, setFichaDia] = useState(null)
  const [statsDia, setStatsDia] = useState(null)
  const [diasFiltro, setDiasFiltro] = useState(() =>
    Math.min(5, Math.max(2, estado.ajustes.diasPlanificados.length || 3)))
  const [modal, setModal] = useState(null)

  function usarPlantilla(plantilla) {
    const id = nuevoId('rut')
    // La copia nace con los nombres en el idioma actual: desde ese momento son
    // del usuario y ya no se traducen.
    const nombrePlantilla = plantillaTexto(plantilla).nombre
    const rutina = {
      id,
      nombre: nombrePlantilla,
      dias: plantilla.dias.map((dia, i) => ({
        id: nuevoId('dia'),
        nombre: nombreDiaPlantilla(plantilla, i),
        ejercicios: dia.ejercicios.map((ej) => ({
          ejercicioId: ej.ejercicioId,
          seriesObjetivo: ej.seriesObjetivo,
          repsObjetivo: ej.repsObjetivo,
          pesoObjetivoKg: null,
        })),
      })),
    }
    actualizarEstado((e) => ({ ...e, rutinas: [...e.rutinas, rutina] }))
    setVerPlantillas(false)
    setRutinaId(id)
    avisar(t(`«${nombrePlantilla}» añadida: revísala y hazla tuya`, `"${nombrePlantilla}" added: review it and make it yours`))
  }

  const rutina = estado.rutinas.find((r) => r.id === rutinaId) || null
  const dia = rutina ? rutina.dias.find((d) => d.id === diaId) || null : null

  function editarRutina(id, fn) {
    actualizarEstado((e) => ({
      ...e,
      rutinas: e.rutinas.map((r) => (r.id === id ? fn(r) : r)),
    }))
  }

  function editarDia(rid, did, fn) {
    editarRutina(rid, (r) => ({
      ...r,
      dias: r.dias.map((d) => (d.id === did ? fn(d) : d)),
    }))
  }

  function crearRutina() {
    const id = nuevoId('rut')
    actualizarEstado((e) => ({
      ...e,
      rutinas: [...e.rutinas, { id, nombre: `${t('Rutina', 'Routine')} ${e.rutinas.length + 1}`, dias: [] }],
    }))
    setRutinaId(id)
  }

  function crearDia() {
    const id = nuevoId('dia')
    editarRutina(rutina.id, (r) => ({
      ...r,
      dias: [...r.dias, { id, nombre: `${t('Día', 'Day')} ${r.dias.length + 1}`, ejercicios: [] }],
    }))
    setDiaId(id)
  }

  function borrarRutina(id) {
    actualizarEstado((e) => ({ ...e, rutinas: e.rutinas.filter((r) => r.id !== id) }))
    setModal(null)
    setDiaId(null)
    setRutinaId(null)
    avisar(t('Rutina borrada', 'Routine deleted'))
  }

  function borrarDia() {
    editarRutina(rutina.id, (r) => ({ ...r, dias: r.dias.filter((d) => d.id !== dia.id) }))
    setModal(null)
    setDiaId(null)
    avisar(t('Día borrado', 'Day deleted'))
  }

  // Desde la lista de días de la rutina, sin tener que entrar en el día.
  function borrarDiaDeLista(diaId) {
    editarRutina(rutina.id, (r) => ({ ...r, dias: r.dias.filter((d) => d.id !== diaId) }))
    setModal(null)
    avisar(t('Día borrado', 'Day deleted'))
  }

  function moverDia(indice, dir) {
    const j = indice + dir
    editarRutina(rutina.id, (r) => {
      if (j < 0 || j >= r.dias.length) return r
      const dias = [...r.dias]
      ;[dias[indice], dias[j]] = [dias[j], dias[indice]]
      return { ...r, dias }
    })
  }

  function anadirEjercicioAlDia(ej) {
    if (dia.ejercicios.some((x) => x.ejercicioId === ej.id)) {
      avisar(t('Ese ejercicio ya está en este día', 'That exercise is already in this day'))
      return
    }
    editarDia(rutina.id, dia.id, (d) => ({
      ...d,
      ejercicios: [
        ...d.ejercicios,
        {
          ejercicioId: ej.id,
          seriesObjetivo: 3,
          repsObjetivo: ej.medida === 'peso_reps' ? 8 : 10,
          pesoObjetivoKg: null,
        },
      ],
    }))
    setModal(null)
  }

  function editarObjetivo(ejercicioId, cambio) {
    editarDia(rutina.id, dia.id, (d) => ({
      ...d,
      ejercicios: d.ejercicios.map((x) => (x.ejercicioId === ejercicioId ? { ...x, ...cambio } : x)),
    }))
  }

  function quitarDelDia(ejercicioId) {
    editarDia(rutina.id, dia.id, (d) => ({
      ...d,
      ejercicios: d.ejercicios.filter((x) => x.ejercicioId !== ejercicioId),
    }))
  }

  function moverEnDia(indice, dir) {
    editarDia(rutina.id, dia.id, (d) => {
      const j = indice + dir
      if (j < 0 || j >= d.ejercicios.length) return d
      const lista = [...d.ejercicios]
      ;[lista[indice], lista[j]] = [lista[j], lista[indice]]
      return { ...d, ejercicios: lista }
    })
  }

  function crearEjercicio({ nombre, grupo, medida, equipo }) {
    const limpio = nombre.trim()
    if (!limpio) {
      avisar(t('Ponle un nombre al ejercicio', 'Give the exercise a name'), 'error')
      return
    }
    const id = idUnico(limpio, estado.ejercicios)
    actualizarEstado((e) => ({
      ...e,
      ejercicios: [...e.ejercicios, { id, nombre: limpio, grupo, medida, equipo, personalizado: true }],
    }))
    setModal(null)
    avisar(t(`«${limpio}» añadido a tu biblioteca`, `"${limpio}" added to your library`))
  }

  function borrarEjercicioBiblioteca(ej) {
    const enRutina = estado.rutinas.some((r) =>
      r.dias.some((d) => d.ejercicios.some((x) => x.ejercicioId === ej.id)))
    if (enRutina) {
      setModal(null)
      avisar(t('Está en una rutina: quítalo de ella antes de borrarlo', 'It is in a routine: remove it from there before deleting it'), 'error')
      return
    }
    const conHistorial = estado.sesiones.some((s) =>
      s.ejercicios.some((x) => x.ejercicioId === ej.id))
    if (conHistorial) {
      setModal(null)
      avisar(t('Tiene entrenos registrados: se conserva para no perder tus gráficas', 'It has logged workouts: it stays so your charts are not lost'), 'error')
      return
    }
    const enSesion = Boolean(estado.sesionActiva) &&
      estado.sesionActiva.ejercicios.some((x) => x.ejercicioId === ej.id)
    if (enSesion) {
      setModal(null)
      avisar(t('Se está usando en la sesión en curso', 'It is being used in the session in progress'), 'error')
      return
    }
    actualizarEstado((e) => ({ ...e, ejercicios: e.ejercicios.filter((x) => x.id !== ej.id) }))
    setModal(null)
    avisar(t(`«${ej.nombre}» borrado de la biblioteca`, `"${ej.nombre}" deleted from the library`))
  }

  // ---------- Rutinas recomendadas (novatos) ----------
  if (verPlantillas) {
    const opciones = plantillasFiltradas(diasFiltro, equipoFiltro)
    const nombreDe = (id) => {
      const ej = estado.ejercicios.find((x) => x.id === id)
      return ej ? nombreEjercicio(ej) : id
    }
    return (
      <div className="vista">
        <button className="btn btn-fantasma rut-volver" onClick={() => setVerPlantillas(false)}>
          ← {t('Rutinas', 'Routines')}
        </button>
        <h1 className="rut-titulo">🗺 {t('Rutinas recomendadas', 'Recommended routines')}</h1>
        <p className="texto-suave rut-intro">
          {t(
            'Para empezar sin perderse: elige cuántos días entrenas, usa una tal cual, y con las semanas la haces tuya.',
            'To start without getting lost: pick how many days you train, use one as is, and over the weeks make it yours.'
          )}
        </p>

        <div className="panel rut-guia">
          <div className="rut-guia-titulo">{t('La guía del novato', "The novice's guide")}</div>
          <ul className="rut-guia-lista">
            {guiaNovato().map((linea, i) => (
              <li key={i}>{linea}</li>
            ))}
          </ul>
        </div>

        <div className="rut-chips rut-chips-dias">
          {EQUIPOS.map(([id, nombre]) => (
            <button
              key={id}
              className={equipoFiltro === id ? 'chip chip-activo' : 'chip'}
              onClick={() => setEquipoFiltro(id)}
            >
              {nombreEquipoPlantilla(id, nombre)}
            </button>
          ))}
        </div>
        <div className="rut-chips rut-chips-dias">
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={diasFiltro === n ? 'chip chip-activo' : 'chip'}
              onClick={() => setDiasFiltro(n)}
            >
              {n} {t('días', 'days')}
            </button>
          ))}
        </div>

        {opciones.length === 0 && (
          <div className="panel rut-vacio-panel">
            <p>{t(`Sin gimnasio, con ${diasFiltro} días lo honesto es otra cosa.`, `Without a gym, with ${diasFiltro} days the honest answer is something else.`)}</p>
            <p className="texto-suave">
              {t(
                'Usa el ciclo de 3 días y repítelo; los días extra, paseo largo o cardio suave. Más días no es mejor: la mejora llega al recuperarte.',
                'Use the 3-day cycle and repeat it; on the extra days, a long walk or easy cardio. More days is not better: the gains come as you recover.'
              )}
            </p>
          </div>
        )}

        {opciones.map((p) => {
          const tx = plantillaTexto(p)
          return (
            <section key={p.id} className="panel rut-plantilla">
              <h2 className="rut-plantilla-nombre">{tx.nombre}</h2>
              <p className="texto-suave rut-plantilla-resumen">{tx.resumen}</p>
              <p className="rut-plantilla-porque">{tx.porQue}</p>
              {p.dias.map((dia, i) => (
                <div key={i} className="rut-pl-dia">
                  <strong>{nombreDiaPlantilla(p, i)}</strong>
                  <span className="tira-minis">
                    {dia.ejercicios.slice(0, 8).map((e) => (
                      <MiniEjercicio key={e.ejercicioId} chica id={e.ejercicioId} />
                    ))}
                  </span>
                  <span className="texto-suave rut-pl-ejercicios">
                    {dia.ejercicios.map((e) => nombreDe(e.ejercicioId)).join(' · ')}
                  </span>
                </div>
              ))}
              <p className="texto-suave rut-plantilla-consejo">💡 {tx.consejo}</p>
              <button className="btn btn-primario rut-boton-ancho" onClick={() => usarPlantilla(p)}>
                {t('Usar esta rutina', 'Use this routine')}
              </button>
            </section>
          )
        })}
      </div>
    )
  }

  // ---------- Biblioteca ----------
  if (verBiblioteca) {
    return (
      <div className="vista">
        <button className="btn btn-fantasma rut-volver" onClick={() => { setModal(null); setVerBiblioteca(false) }}>
          ← {t('Rutinas', 'Routines')}
        </button>
        <h1 className="rut-titulo">📚 {t('Biblioteca', 'Library')}</h1>
        <p className="texto-suave rut-intro">
          {t(
            `Tu arsenal: ${estado.ejercicios.length} ejercicios. Los marcados con ✦ los has forjado tú.`,
            `Your arsenal: ${estado.ejercicios.length} exercises. The ones marked ✦ you forged yourself.`
          )}
        </p>
        <button className="btn rut-boton-ancho" onClick={() => setModal({ tipo: 'nuevo-ejercicio' })}>
          ＋ {t('Crear ejercicio propio', 'Create your own exercise')}
        </button>
        <SelectorEjercicios
          estado={estado}
          ejercicios={estado.ejercicios}
          alBorrar={(ej) => setModal({ tipo: 'borrar-ejercicio', ej })}
        />
        {modal && modal.tipo === 'nuevo-ejercicio' && (
          <Modal titulo={t('Nuevo ejercicio', 'New exercise')} abierto onCerrar={() => setModal(null)}>
            <FormNuevoEjercicio alCrear={crearEjercicio} />
          </Modal>
        )}
        {modal && modal.tipo === 'borrar-ejercicio' && (
          <Modal titulo={t('Borrar ejercicio', 'Delete exercise')} abierto onCerrar={() => setModal(null)}>
            <p>{t(`¿Borrar «${modal.ej.nombre}» de tu biblioteca?`, `Delete "${modal.ej.nombre}" from your library?`)}</p>
            <div className="fila rut-modal-botones">
              <button className="btn" onClick={() => setModal(null)}>{t('Cancelar', 'Cancel')}</button>
              <button className="btn btn-peligro" onClick={() => borrarEjercicioBiblioteca(modal.ej)}>{t('Borrar', 'Delete')}</button>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  // ---------- Editor de día ----------
  if (rutina && dia) {
    return (
      <div className="vista">
        <button className="btn btn-fantasma rut-volver" onClick={() => { setModal(null); setDiaId(null) }}>
          ← {rutina.nombre || t('Rutina', 'Routine')}
        </button>
        <label className="etiqueta" htmlFor="rut-nombre-dia">{t('Nombre del día', 'Day name')}</label>
        <input
          id="rut-nombre-dia"
          className="input"
          value={dia.nombre}
          onChange={(ev) => editarDia(rutina.id, dia.id, (d) => ({ ...d, nombre: ev.target.value }))}
          placeholder={t('Torso, Pierna, Empuje…', 'Upper, Legs, Push…')}
        />
        <p className="texto-suave rut-autosave">{t('Todo se guarda solo mientras editas.', 'Everything saves itself as you edit.')}</p>
        <h2 className="titulo-seccion">{t('Ejercicios del día', "The day's exercises")}</h2>
        {dia.ejercicios.length === 0 && (
          <p className="texto-suave rut-vacio">{t('Aún no hay ejercicios. Añade el primero y dale forma a este día.', 'No exercises yet. Add the first one and give this day its shape.')}</p>
        )}
        {dia.ejercicios.map((obj, indice) => {
          const ej = estado.ejercicios.find((x) => x.id === obj.ejercicioId) ||
            { id: obj.ejercicioId, nombre: obj.ejercicioId, grupo: '', medida: 'peso_reps' }
          return (
            <div className="panel rut-ejercicio" key={obj.ejercicioId}>
              <div className="rut-ejercicio-cab">
                <MiniEjercicio id={ej.id} />
                <div className="rut-ejercicio-titular">
                  <div className="rut-ejercicio-nombre">{nombreEjercicio(ej)}</div>
                  <div className="texto-suave rut-picker-meta">
                    {nombreGrupo(ej.grupo)} · {nombreMedida(ej.medida)}
                  </div>
                </div>
                <span className="rut-ejercicio-acciones">
                  <button
                    className="rut-info"
                    aria-label={t(`Ver técnica de ${nombreEjercicio(ej)}`, `View technique for ${nombreEjercicio(ej)}`)}
                    onClick={() => setFichaDia(ej)}
                  >
                    ⓘ
                  </button>
                  <button
                    className="rut-info"
                    aria-label={t(`Ver mis estadísticas de ${nombreEjercicio(ej)}`, `View my stats for ${nombreEjercicio(ej)}`)}
                    onClick={() => setStatsDia(ej)}
                  >
                    <IconoProgreso tam={17} />
                  </button>
                  <button
                    type="button"
                    className="ent-mover-btn"
                    disabled={indice === 0}
                    onClick={() => moverEnDia(indice, -1)}
                    aria-label={t(`Subir ${nombreEjercicio(ej)}`, `Move ${nombreEjercicio(ej)} up`)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="ent-mover-btn"
                    disabled={indice === dia.ejercicios.length - 1}
                    onClick={() => moverEnDia(indice, 1)}
                    aria-label={t(`Bajar ${nombreEjercicio(ej)}`, `Move ${nombreEjercicio(ej)} down`)}
                  >
                    ↓
                  </button>
                  <button
                    className="rut-quitar"
                    aria-label={t(`Quitar ${nombreEjercicio(ej)}`, `Remove ${nombreEjercicio(ej)}`)}
                    onClick={() => quitarDelDia(obj.ejercicioId)}
                  >
                    ✕
                  </button>
                </span>
              </div>
              <div className="rut-objetivos">
                <div className="rut-objetivo">
                  <span className="rut-objetivo-etiqueta">{t('Series', 'Sets')}</span>
                  <Stepper
                    valor={obj.seriesObjetivo}
                    paso={1}
                    min={1}
                    max={10}
                    onCambiar={(v) => editarObjetivo(obj.ejercicioId, { seriesObjetivo: v })}
                  />
                </div>
                <div className="rut-objetivo">
                  <span className="rut-objetivo-etiqueta">{ej.medida === 'tiempo' ? t('Minutos', 'Minutes') : t('Reps', 'Reps')}</span>
                  <Stepper
                    valor={obj.repsObjetivo}
                    paso={1}
                    min={1}
                    max={ej.medida === 'tiempo' ? 300 : 50}
                    onCambiar={(v) => editarObjetivo(obj.ejercicioId, { repsObjetivo: v })}
                  />
                </div>
                {ej.medida === 'peso_reps' && (
                  <div className="rut-objetivo">
                    <span className="rut-objetivo-etiqueta">{t('Peso', 'Weight')}</span>
                    <Stepper
                      valor={obj.pesoObjetivoKg != null ? obj.pesoObjetivoKg : 0}
                      paso={2.5}
                      min={0}
                      max={500}
                      unidad="kg"
                      onCambiar={(v) => editarObjetivo(obj.ejercicioId, { pesoObjetivoKg: v > 0 ? v : null })}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <button className="btn rut-boton-ancho" onClick={() => setModal({ tipo: 'picker' })}>
          ＋ {t('Añadir ejercicio', 'Add exercise')}
        </button>
        <button
          className="btn btn-primario btn-grande rut-listo"
          onClick={() => {
            setModal(null)
            setDiaId(null)
            avisar(t(`«${dia.nombre || 'Día'}» guardado`, `"${dia.nombre || 'Day'}" saved`))
          }}
        >
          ✓ {t('Día listo', 'Day ready')}
        </button>
        <button className="rut-borrar-enlace" onClick={() => setModal({ tipo: 'borrar-dia' })}>
          {t('Borrar este día', 'Delete this day')}
        </button>
        <FichaEjercicio ejercicio={fichaDia} abierto={Boolean(fichaDia)} onCerrar={() => setFichaDia(null)} />
        <EstadisticasEjercicio estado={estado} ejercicio={statsDia} abierto={Boolean(statsDia)} onCerrar={() => setStatsDia(null)} />
        {modal && modal.tipo === 'picker' && (
          <Modal titulo={t('Añadir ejercicio', 'Add exercise')} abierto onCerrar={() => setModal(null)}>
            <SelectorEjercicios estado={estado} ejercicios={estado.ejercicios} alElegir={anadirEjercicioAlDia} />
          </Modal>
        )}
        {modal && modal.tipo === 'borrar-dia' && (
          <Modal titulo={t('Borrar día', 'Delete day')} abierto onCerrar={() => setModal(null)}>
            <p>{t(`¿Borrar «${dia.nombre}» de esta rutina? Tus sesiones ya registradas no se tocan.`, `Delete "${dia.nombre}" from this routine? Your logged sessions stay untouched.`)}</p>
            <div className="fila rut-modal-botones">
              <button className="btn" onClick={() => setModal(null)}>{t('Cancelar', 'Cancel')}</button>
              <button className="btn btn-peligro" onClick={borrarDia}>{t('Borrar', 'Delete')}</button>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  // ---------- Detalle de rutina ----------
  if (rutina) {
    return (
      <div className="vista">
        <button className="btn btn-fantasma rut-volver" onClick={() => { setModal(null); setRutinaId(null) }}>
          ← {t('Rutinas', 'Routines')}
        </button>
        <label className="etiqueta" htmlFor="rut-nombre-rutina">{t('Nombre de la rutina', 'Routine name')}</label>
        <input
          id="rut-nombre-rutina"
          className="input"
          value={rutina.nombre}
          onChange={(ev) => editarRutina(rutina.id, (r) => ({ ...r, nombre: ev.target.value }))}
          placeholder={t('Torso / Pierna', 'Upper / Lower')}
        />
        <p className="texto-suave rut-autosave">{t('Todo se guarda solo mientras editas.', 'Everything saves itself as you edit.')}</p>
        <h2 className="titulo-seccion">{t('Días de entreno', 'Workout days')}</h2>
        {rutina.dias.length === 0 && (
          <p className="texto-suave rut-vacio">{t('Una rutina se forja día a día. Crea el primero.', 'A routine is forged day by day. Create the first one.')}</p>
        )}
        {rutina.dias.map((d, indice) => (
          <div key={d.id} className="rut-dia-fila">
            <button className="rut-dia" onClick={() => setDiaId(d.id)}>
              <span className="rut-dia-izq">
                <span className="rut-dia-nombre">{d.nombre || t('Día', 'Day')}</span>
                {d.ejercicios.length > 0 && (
                  <span className="tira-minis">
                    {d.ejercicios.slice(0, 8).map((x) => (
                      <MiniEjercicio key={x.ejercicioId} chica id={x.ejercicioId} />
                    ))}
                  </span>
                )}
                <span className="texto-suave rut-dia-meta">
                  {d.ejercicios.length} {d.ejercicios.length === 1 ? t('ejercicio', 'exercise') : t('ejercicios', 'exercises')} ›
                </span>
              </span>
            </button>
            <span className="rut-dia-acciones">
              <button
                type="button"
                className="ent-mover-btn"
                disabled={indice === 0}
                onClick={() => moverDia(indice, -1)}
                aria-label={t(`Subir ${d.nombre || 'día'}`, `Move ${d.nombre || 'day'} up`)}
              >
                ↑
              </button>
              <button
                type="button"
                className="ent-mover-btn"
                disabled={indice === rutina.dias.length - 1}
                onClick={() => moverDia(indice, 1)}
                aria-label={t(`Bajar ${d.nombre || 'día'}`, `Move ${d.nombre || 'day'} down`)}
              >
                ↓
              </button>
              <button
                className="rut-quitar"
                aria-label={t(`Borrar ${d.nombre || 'día'}`, `Delete ${d.nombre || 'day'}`)}
                onClick={() => setModal({ tipo: 'borrar-dia-lista', dia: d })}
              >
                ✕
              </button>
            </span>
          </div>
        ))}
        <button className="btn rut-boton-ancho" onClick={crearDia}>＋ {t('Añadir día', 'Add day')}</button>
        <button
          className="btn btn-primario btn-grande rut-listo"
          onClick={() => {
            setModal(null)
            setRutinaId(null)
            avisar(t(
              `«${rutina.nombre || 'Rutina'}» guardada · te espera en ⚔️ Entreno`,
              `"${rutina.nombre || 'Routine'}" saved · it awaits you in ⚔️ Workout`
            ))
          }}
        >
          ✓ {t('Rutina lista', 'Routine ready')}
        </button>
        <button className="rut-borrar-enlace" onClick={() => setModal({ tipo: 'borrar-rutina' })}>
          {t('Borrar rutina', 'Delete routine')}
        </button>
        {modal && modal.tipo === 'borrar-dia-lista' && (
          <Modal titulo={t('Borrar día', 'Delete day')} abierto onCerrar={() => setModal(null)}>
            <p>{t(
              `¿Borrar «${modal.dia.nombre || 'este día'}» de la rutina? Tus sesiones ya registradas no se tocan.`,
              `Delete "${modal.dia.nombre || 'this day'}" from the routine? Your logged sessions stay untouched.`
            )}</p>
            <div className="fila rut-modal-botones">
              <button className="btn" onClick={() => setModal(null)}>{t('Cancelar', 'Cancel')}</button>
              <button className="btn btn-peligro" onClick={() => borrarDiaDeLista(modal.dia.id)}>{t('Borrar', 'Delete')}</button>
            </div>
          </Modal>
        )}
        {modal && modal.tipo === 'borrar-rutina' && (
          <Modal titulo={t('Borrar rutina', 'Delete routine')} abierto onCerrar={() => setModal(null)}>
            <p>
              {t(
                `¿Borrar «${rutina.nombre || 'esta rutina'}» con sus ${rutina.dias.length} día${rutina.dias.length === 1 ? '' : 's'}? Tus sesiones ya registradas no se tocan.`,
                `Delete "${rutina.nombre || 'this routine'}" and its ${rutina.dias.length} day${rutina.dias.length === 1 ? '' : 's'}? Your logged sessions stay untouched.`
              )}
            </p>
            <div className="fila rut-modal-botones">
              <button className="btn" onClick={() => setModal(null)}>{t('Cancelar', 'Cancel')}</button>
              <button className="btn btn-peligro" onClick={() => borrarRutina(rutina.id)}>{t('Borrar', 'Delete')}</button>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  // ---------- Lista de rutinas ----------
  return (
    <div className="vista">
      <h1 className="rut-titulo">📜 {t('Rutinas', 'Routines')}</h1>
      <p className="texto-suave rut-intro">{t('Tus planes de batalla. Defínelos aquí y el modo entreno hará el resto.', 'Your battle plans. Shape them here and workout mode will do the rest.')}</p>
      {estado.rutinas.length === 0 && (
        <div className="panel rut-vacio-panel">
          <p>{t('Aún no tienes rutinas.', 'You have no routines yet.')}</p>
          <p className="texto-suave">
            {t(
              '¿Primera vez? Las rutinas recomendadas te dan un plan probado con un toque. Y si ya sabes lo que quieres, forja el tuyo.',
              'First time? The recommended routines hand you a proven plan in one tap. And if you already know what you want, forge your own.'
            )}
          </p>
        </div>
      )}
      {estado.rutinas.map((r) => (
        <button key={r.id} className="rut-dia" onClick={() => setRutinaId(r.id)}>
          <span className="rut-dia-nombre">{r.nombre || t('Sin nombre', 'Unnamed')}</span>
          <span className="texto-suave rut-dia-meta">
            {r.dias.length} {r.dias.length === 1 ? t('día', 'day') : t('días', 'days')} ›
          </span>
        </button>
      ))}
      <button className="btn rut-boton-ancho" onClick={() => setVerPlantillas(true)}>
        🗺 {t('Rutinas recomendadas (para empezar)', 'Recommended routines (to get started)')}
      </button>
      <button className="btn btn-primario rut-boton-ancho" onClick={crearRutina}>＋ {t('Nueva rutina', 'New routine')}</button>
      <h2 className="titulo-seccion">{t('Biblioteca', 'Library')}</h2>
      <button className="btn rut-boton-ancho" onClick={() => setVerBiblioteca(true)}>
        📚 {t('Biblioteca de ejercicios', 'Exercise library')} ({estado.ejercicios.length})
      </button>
    </div>
  )
}
