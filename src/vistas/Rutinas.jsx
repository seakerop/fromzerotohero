import { useMemo, useState } from 'react'
import FichaEjercicio from '../components/FichaEjercicio.jsx'
import Modal from '../components/Modal.jsx'
import Stepper from '../components/Stepper.jsx'
import { GRUPOS } from '../data/ejercicios.js'

const NOMBRE_MEDIDA = {
  peso_reps: 'peso × reps',
  reps: 'solo reps',
  tiempo: 'tiempo (min)',
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
  const g = GRUPOS.find((x) => x.id === grupoId)
  return g ? g.nombre : grupoId
}

// Buscador de biblioteca con filtro por grupo. Lo reutiliza Entreno para
// añadir ejercicios sobre la marcha (por eso va exportado).
export function SelectorEjercicios({ ejercicios, alElegir, alBorrar }) {
  const [busqueda, setBusqueda] = useState('')
  const [grupo, setGrupo] = useState('todos')
  const [ficha, setFicha] = useState(null)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return ejercicios.filter((ej) => {
      if (grupo !== 'todos' && ej.grupo !== grupo) return false
      if (q && !ej.nombre.toLowerCase().includes(q)) return false
      return true
    })
  }, [ejercicios, busqueda, grupo])

  const Cuerpo = alElegir ? 'button' : 'div'

  return (
    <div className="rut-picker">
      <input
        className="input"
        type="search"
        placeholder="Buscar ejercicio…"
        value={busqueda}
        onChange={(ev) => setBusqueda(ev.target.value)}
        aria-label="Buscar ejercicio"
      />
      <div className="rut-chips">
        <button
          className={'chip' + (grupo === 'todos' ? ' chip-activo' : '')}
          onClick={() => setGrupo('todos')}
        >
          Todos
        </button>
        {GRUPOS.map((g) => (
          <button
            key={g.id}
            className={'chip' + (grupo === g.id ? ' chip-activo' : '')}
            onClick={() => setGrupo(g.id)}
          >
            {g.nombre}
          </button>
        ))}
      </div>
      <div className="rut-picker-lista">
        {filtrados.map((ej) => (
          <div className="rut-picker-item" key={ej.id}>
            <Cuerpo
              className="rut-picker-elegir"
              onClick={alElegir ? () => alElegir(ej) : undefined}
            >
              <span className="rut-picker-nombre">{ej.nombre}{ej.personalizado ? ' ✦' : ''}</span>
              <span className="texto-suave rut-picker-meta">
                {nombreGrupo(ej.grupo)} · {NOMBRE_MEDIDA[ej.medida] || ej.medida}
              </span>
            </Cuerpo>
            <button
              className="rut-info"
              aria-label={`Ver técnica de ${ej.nombre}`}
              onClick={() => setFicha(ej)}
            >
              ⓘ
            </button>
            {alBorrar && ej.personalizado && (
              <button
                className="rut-quitar"
                aria-label={`Borrar ${ej.nombre}`}
                onClick={() => alBorrar(ej)}
              >
                🗑
              </button>
            )}
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="texto-suave rut-vacio">Ningún ejercicio encaja con la búsqueda.</p>
        )}
      </div>
      <FichaEjercicio ejercicio={ficha} abierto={Boolean(ficha)} onCerrar={() => setFicha(null)} />
    </div>
  )
}

function FormNuevoEjercicio({ alCrear }) {
  const [nombre, setNombre] = useState('')
  const [grupo, setGrupo] = useState(GRUPOS[0].id)
  const [medida, setMedida] = useState('peso_reps')

  return (
    <div className="rut-form">
      <label className="etiqueta" htmlFor="rut-nuevo-nombre">Nombre</label>
      <input
        id="rut-nuevo-nombre"
        className="input"
        value={nombre}
        onChange={(ev) => setNombre(ev.target.value)}
        placeholder="Press Arnold"
      />
      <label className="etiqueta" htmlFor="rut-nuevo-grupo">Grupo muscular</label>
      <select
        id="rut-nuevo-grupo"
        className="input"
        value={grupo}
        onChange={(ev) => setGrupo(ev.target.value)}
      >
        {GRUPOS.map((g) => (
          <option key={g.id} value={g.id}>{g.nombre}</option>
        ))}
      </select>
      <label className="etiqueta" htmlFor="rut-nueva-medida">Cómo se mide</label>
      <select
        id="rut-nueva-medida"
        className="input"
        value={medida}
        onChange={(ev) => setMedida(ev.target.value)}
      >
        <option value="peso_reps">Peso × repeticiones</option>
        <option value="reps">Solo repeticiones</option>
        <option value="tiempo">Tiempo (minutos)</option>
      </select>
      <button className="btn btn-primario rut-boton-ancho" onClick={() => alCrear({ nombre, grupo, medida })}>
        Añadir a la biblioteca
      </button>
    </div>
  )
}

export default function Rutinas({ estado, actualizarEstado, avisar }) {
  const [rutinaId, setRutinaId] = useState(null)
  const [diaId, setDiaId] = useState(null)
  const [verBiblioteca, setVerBiblioteca] = useState(false)
  const [modal, setModal] = useState(null)

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
      rutinas: [...e.rutinas, { id, nombre: `Rutina ${e.rutinas.length + 1}`, dias: [] }],
    }))
    setRutinaId(id)
  }

  function crearDia() {
    const id = nuevoId('dia')
    editarRutina(rutina.id, (r) => ({
      ...r,
      dias: [...r.dias, { id, nombre: `Día ${r.dias.length + 1}`, ejercicios: [] }],
    }))
    setDiaId(id)
  }

  function borrarRutina(id) {
    actualizarEstado((e) => ({ ...e, rutinas: e.rutinas.filter((r) => r.id !== id) }))
    setModal(null)
    setDiaId(null)
    setRutinaId(null)
    avisar('Rutina borrada')
  }

  function borrarDia() {
    editarRutina(rutina.id, (r) => ({ ...r, dias: r.dias.filter((d) => d.id !== dia.id) }))
    setModal(null)
    setDiaId(null)
    avisar('Día borrado')
  }

  function anadirEjercicioAlDia(ej) {
    if (dia.ejercicios.some((x) => x.ejercicioId === ej.id)) {
      avisar('Ese ejercicio ya está en este día')
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

  function crearEjercicio({ nombre, grupo, medida }) {
    const limpio = nombre.trim()
    if (!limpio) {
      avisar('Ponle un nombre al ejercicio', 'error')
      return
    }
    const id = idUnico(limpio, estado.ejercicios)
    actualizarEstado((e) => ({
      ...e,
      ejercicios: [...e.ejercicios, { id, nombre: limpio, grupo, medida, personalizado: true }],
    }))
    setModal(null)
    avisar(`«${limpio}» añadido a tu biblioteca`)
  }

  function borrarEjercicioBiblioteca(ej) {
    const enRutina = estado.rutinas.some((r) =>
      r.dias.some((d) => d.ejercicios.some((x) => x.ejercicioId === ej.id)))
    if (enRutina) {
      setModal(null)
      avisar('Está en una rutina: quítalo de ella antes de borrarlo', 'error')
      return
    }
    const conHistorial = estado.sesiones.some((s) =>
      s.ejercicios.some((x) => x.ejercicioId === ej.id))
    if (conHistorial) {
      setModal(null)
      avisar('Tiene entrenos registrados: se conserva para no perder tus gráficas', 'error')
      return
    }
    const enSesion = Boolean(estado.sesionActiva) &&
      estado.sesionActiva.ejercicios.some((x) => x.ejercicioId === ej.id)
    if (enSesion) {
      setModal(null)
      avisar('Se está usando en la sesión en curso', 'error')
      return
    }
    actualizarEstado((e) => ({ ...e, ejercicios: e.ejercicios.filter((x) => x.id !== ej.id) }))
    setModal(null)
    avisar(`«${ej.nombre}» borrado de la biblioteca`)
  }

  // ---------- Biblioteca ----------
  if (verBiblioteca) {
    return (
      <div className="vista">
        <button className="btn btn-fantasma rut-volver" onClick={() => { setModal(null); setVerBiblioteca(false) }}>
          ← Rutinas
        </button>
        <h1 className="rut-titulo">📚 Biblioteca</h1>
        <p className="texto-suave rut-intro">
          Tu arsenal: {estado.ejercicios.length} ejercicios. Los marcados con ✦ los has forjado tú.
        </p>
        <button className="btn rut-boton-ancho" onClick={() => setModal({ tipo: 'nuevo-ejercicio' })}>
          ＋ Crear ejercicio propio
        </button>
        <SelectorEjercicios
          ejercicios={estado.ejercicios}
          alBorrar={(ej) => setModal({ tipo: 'borrar-ejercicio', ej })}
        />
        {modal && modal.tipo === 'nuevo-ejercicio' && (
          <Modal titulo="Nuevo ejercicio" abierto onCerrar={() => setModal(null)}>
            <FormNuevoEjercicio alCrear={crearEjercicio} />
          </Modal>
        )}
        {modal && modal.tipo === 'borrar-ejercicio' && (
          <Modal titulo="Borrar ejercicio" abierto onCerrar={() => setModal(null)}>
            <p>¿Borrar «{modal.ej.nombre}» de tu biblioteca?</p>
            <div className="fila rut-modal-botones">
              <button className="btn" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-peligro" onClick={() => borrarEjercicioBiblioteca(modal.ej)}>Borrar</button>
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
          ← {rutina.nombre || 'Rutina'}
        </button>
        <label className="etiqueta" htmlFor="rut-nombre-dia">Nombre del día</label>
        <input
          id="rut-nombre-dia"
          className="input"
          value={dia.nombre}
          onChange={(ev) => editarDia(rutina.id, dia.id, (d) => ({ ...d, nombre: ev.target.value }))}
          placeholder="Torso, Pierna, Empuje…"
        />
        <p className="texto-suave rut-autosave">Todo se guarda solo mientras editas.</p>
        <h2 className="titulo-seccion">Ejercicios del día</h2>
        {dia.ejercicios.length === 0 && (
          <p className="texto-suave rut-vacio">Aún no hay ejercicios. Añade el primero y dale forma a este día.</p>
        )}
        {dia.ejercicios.map((obj, indice) => {
          const ej = estado.ejercicios.find((x) => x.id === obj.ejercicioId) ||
            { id: obj.ejercicioId, nombre: obj.ejercicioId, grupo: '', medida: 'peso_reps' }
          return (
            <div className="panel rut-ejercicio" key={obj.ejercicioId}>
              <div className="rut-ejercicio-cab">
                <div>
                  <div className="rut-ejercicio-nombre">{ej.nombre}</div>
                  <div className="texto-suave rut-picker-meta">
                    {nombreGrupo(ej.grupo)} · {NOMBRE_MEDIDA[ej.medida] || ej.medida}
                  </div>
                </div>
                <span className="ent-mover">
                  <button
                    type="button"
                    className="ent-mover-btn"
                    disabled={indice === 0}
                    onClick={() => moverEnDia(indice, -1)}
                    aria-label={`Subir ${ej.nombre}`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="ent-mover-btn"
                    disabled={indice === dia.ejercicios.length - 1}
                    onClick={() => moverEnDia(indice, 1)}
                    aria-label={`Bajar ${ej.nombre}`}
                  >
                    ↓
                  </button>
                </span>
                <button
                  className="rut-quitar"
                  aria-label={`Quitar ${ej.nombre}`}
                  onClick={() => quitarDelDia(obj.ejercicioId)}
                >
                  ✕
                </button>
              </div>
              <div className="rut-objetivos">
                <div className="rut-objetivo">
                  <span className="rut-objetivo-etiqueta">Series</span>
                  <Stepper
                    valor={obj.seriesObjetivo}
                    paso={1}
                    min={1}
                    max={10}
                    onCambiar={(v) => editarObjetivo(obj.ejercicioId, { seriesObjetivo: v })}
                  />
                </div>
                <div className="rut-objetivo">
                  <span className="rut-objetivo-etiqueta">{ej.medida === 'tiempo' ? 'Minutos' : 'Reps'}</span>
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
                    <span className="rut-objetivo-etiqueta">Peso</span>
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
          ＋ Añadir ejercicio
        </button>
        <button
          className="btn btn-primario btn-grande rut-listo"
          onClick={() => { setModal(null); setDiaId(null); avisar(`«${dia.nombre || 'Día'}» guardado`) }}
        >
          ✓ Día listo
        </button>
        <button className="rut-borrar-enlace" onClick={() => setModal({ tipo: 'borrar-dia' })}>
          Borrar este día
        </button>
        {modal && modal.tipo === 'picker' && (
          <Modal titulo="Añadir ejercicio" abierto onCerrar={() => setModal(null)}>
            <SelectorEjercicios ejercicios={estado.ejercicios} alElegir={anadirEjercicioAlDia} />
          </Modal>
        )}
        {modal && modal.tipo === 'borrar-dia' && (
          <Modal titulo="Borrar día" abierto onCerrar={() => setModal(null)}>
            <p>¿Borrar «{dia.nombre}» de esta rutina? Tus sesiones ya registradas no se tocan.</p>
            <div className="fila rut-modal-botones">
              <button className="btn" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-peligro" onClick={borrarDia}>Borrar</button>
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
          ← Rutinas
        </button>
        <label className="etiqueta" htmlFor="rut-nombre-rutina">Nombre de la rutina</label>
        <input
          id="rut-nombre-rutina"
          className="input"
          value={rutina.nombre}
          onChange={(ev) => editarRutina(rutina.id, (r) => ({ ...r, nombre: ev.target.value }))}
          placeholder="Torso / Pierna"
        />
        <p className="texto-suave rut-autosave">Todo se guarda solo mientras editas.</p>
        <h2 className="titulo-seccion">Días de entreno</h2>
        {rutina.dias.length === 0 && (
          <p className="texto-suave rut-vacio">Una rutina se forja día a día. Crea el primero.</p>
        )}
        {rutina.dias.map((d) => (
          <button key={d.id} className="rut-dia" onClick={() => setDiaId(d.id)}>
            <span className="rut-dia-nombre">{d.nombre || 'Día'}</span>
            <span className="texto-suave rut-dia-meta">
              {d.ejercicios.length} ejercicio{d.ejercicios.length === 1 ? '' : 's'} ›
            </span>
          </button>
        ))}
        <button className="btn rut-boton-ancho" onClick={crearDia}>＋ Añadir día</button>
        <button
          className="btn btn-primario btn-grande rut-listo"
          onClick={() => {
            setModal(null)
            setRutinaId(null)
            avisar(`«${rutina.nombre || 'Rutina'}» guardada · te espera en ⚔️ Entreno`)
          }}
        >
          ✓ Rutina lista
        </button>
        <button className="rut-borrar-enlace" onClick={() => setModal({ tipo: 'borrar-rutina' })}>
          Borrar rutina
        </button>
        {modal && modal.tipo === 'borrar-rutina' && (
          <Modal titulo="Borrar rutina" abierto onCerrar={() => setModal(null)}>
            <p>
              ¿Borrar «{rutina.nombre || 'esta rutina'}» con sus {rutina.dias.length} día{rutina.dias.length === 1 ? '' : 's'}?
              Tus sesiones ya registradas no se tocan.
            </p>
            <div className="fila rut-modal-botones">
              <button className="btn" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-peligro" onClick={() => borrarRutina(rutina.id)}>Borrar</button>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  // ---------- Lista de rutinas ----------
  return (
    <div className="vista">
      <h1 className="rut-titulo">📜 Rutinas</h1>
      <p className="texto-suave rut-intro">Tus planes de batalla. Defínelos aquí y el modo entreno hará el resto.</p>
      {estado.rutinas.length === 0 && (
        <div className="panel rut-vacio-panel">
          <p>Aún no tienes rutinas.</p>
          <p className="texto-suave">
            Forja tu primer plan: días, ejercicios y objetivos. En el gimnasio solo tendrás que seguirlo.
          </p>
        </div>
      )}
      {estado.rutinas.map((r) => (
        <button key={r.id} className="rut-dia" onClick={() => setRutinaId(r.id)}>
          <span className="rut-dia-nombre">{r.nombre || 'Sin nombre'}</span>
          <span className="texto-suave rut-dia-meta">
            {r.dias.length} día{r.dias.length === 1 ? '' : 's'} ›
          </span>
        </button>
      ))}
      <button className="btn btn-primario rut-boton-ancho" onClick={crearRutina}>＋ Nueva rutina</button>
      <h2 className="titulo-seccion">Biblioteca</h2>
      <button className="btn rut-boton-ancho" onClick={() => setVerBiblioteca(true)}>
        📚 Biblioteca de ejercicios ({estado.ejercicios.length})
      </button>
    </div>
  )
}
