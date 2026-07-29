import { useState } from 'react'
import Modal from '../components/Modal.jsx'
import Stepper from '../components/Stepper.jsx'
import { claveDia } from '../engine/fechas.js'
import { exportarJSON, exportarJSONConFotos, importarCopia } from '../db/exportar.js'
import { borrarTodasLasFotos, restaurarFotos, serializarFotos } from '../db/fotos.js'

const DIAS = [
  [1, 'L', 'lunes'],
  [2, 'M', 'martes'],
  [3, 'X', 'miércoles'],
  [4, 'J', 'jueves'],
  [5, 'V', 'viernes'],
  [6, 'S', 'sábado'],
  [7, 'D', 'domingo'],
]

export default function Ajustes({ estado, actualizarEstado, avisar }) {
  const [apodo, setApodo] = useState(estado.perfil.apodo)
  const [edad, setEdad] = useState(String(estado.perfil.edad ?? ''))
  const [altura, setAltura] = useState(String(estado.perfil.alturaCm ?? ''))
  const [importado, setImportado] = useState(null)
  const [pasoBorrar, setPasoBorrar] = useState(0)
  const [textoBorrar, setTextoBorrar] = useState('')

  function guardarPerfil() {
    const apodoLimpio = apodo.trim()
    const edadNum = Math.round(Number(edad))
    const alturaNum = Math.round(Number(altura))
    if (!apodoLimpio || !(edadNum > 0) || !(alturaNum > 0)) {
      avisar('Revisa los datos del perfil', 'error')
      return
    }
    actualizarEstado((prev) => ({
      ...prev,
      perfil: { ...prev.perfil, apodo: apodoLimpio, edad: edadNum, alturaCm: alturaNum },
    }))
    avisar('Perfil actualizado')
  }

  function alternarDia(dia) {
    actualizarEstado((prev) => {
      const tiene = prev.ajustes.diasPlanificados.includes(dia)
      const dias = tiene
        ? prev.ajustes.diasPlanificados.filter((d) => d !== dia)
        : [...prev.ajustes.diasPlanificados, dia].sort((a, b) => a - b)
      return { ...prev, ajustes: { ...prev.ajustes, diasPlanificados: dias } }
    })
  }

  function cambiarDescanso(segundos) {
    actualizarEstado((prev) => ({
      ...prev,
      ajustes: { ...prev.ajustes, descansoSeg: segundos },
    }))
  }

  async function exportar() {
    const hoy = claveDia()
    let texto
    try {
      const fotos = estado.cuerpo.fotos || []
      texto = fotos.length > 0
        ? exportarJSONConFotos(estado, await serializarFotos(fotos), hoy)
        : exportarJSON(estado, hoy)
    } catch {
      texto = exportarJSON(estado, hoy) // sin fotos antes que sin copia
      avisar('Las fotos no cupieron en la copia: se exporta sin ellas', 'error')
    }
    const nombre = `fromzerotohero-${hoy}.json`
    const archivo = new File([texto], nombre, { type: 'application/json' })

    // En iOS (sobre todo instalada como PWA) la descarga con <a download> es
    // poco fiable: mejor la hoja de compartir, que ofrece «Guardar en Archivos».
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const instalada = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if ((esIOS || instalada) && navigator.canShare && navigator.canShare({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: 'Copia de FromZeroToHero' })
        avisar('Copia compartida: guárdala en Archivos o donde quieras')
      } catch (err) {
        if (!err || err.name !== 'AbortError') avisar('No se pudo compartir la copia', 'error')
      }
      return
    }

    const blob = new Blob([texto], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = nombre
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    avisar('Copia descargada')
  }

  async function alElegirCopia(ev) {
    const fichero = ev.target.files && ev.target.files[0]
    ev.target.value = ''
    if (!fichero) return
    try {
      const texto = await fichero.text()
      setImportado(importarCopia(texto))
    } catch (err) {
      avisar(err && err.message ? err.message : 'Ese fichero no parece una copia válida', 'error')
    }
  }

  async function confirmarImportar() {
    const { estado: nuevo, fotos } = importado
    setImportado(null)
    let final = nuevo
    try {
      // El import reemplaza TODO: los blobs del estado anterior sobran.
      await borrarTodasLasFotos()
    } catch {
      // si no se puede limpiar, la copia entra igual
    }
    if (fotos.length > 0) {
      try {
        const metadatos = await restaurarFotos(fotos)
        final = { ...nuevo, cuerpo: { ...nuevo.cuerpo, fotos: metadatos } }
      } catch {
        // si las fotos fallan, el resto de la copia entra igual
      }
    }
    actualizarEstado(() => final)
    // Resincroniza el formulario de perfil: sin esto, «Guardar cambios»
    // machacaría el perfil recién importado con los valores anteriores.
    setApodo(final.perfil.apodo)
    setEdad(String(final.perfil.edad ?? ''))
    setAltura(String(final.perfil.alturaCm ?? ''))
    avisar('Datos importados')
  }

  function cerrarBorrar() {
    setPasoBorrar(0)
    setTextoBorrar('')
  }

  function borrarTodo() {
    cerrarBorrar()
    actualizarEstado(() => null)
    const recargar = () => window.location.reload()
    const peticion = window.indexedDB.deleteDatabase('fzth')
    peticion.onsuccess = recargar
    peticion.onerror = recargar
    peticion.onblocked = recargar
    setTimeout(recargar, 1500)
  }

  return (
    <div className="vista">
      <h1 className="aju-titulo">Ajustes</h1>

      <div className="titulo-seccion">Perfil</div>
      <div className="panel">
        <label className="etiqueta" htmlFor="aju-apodo">Apodo</label>
        <input
          id="aju-apodo"
          className="input"
          type="text"
          value={apodo}
          onChange={(e) => setApodo(e.target.value)}
        />
        <div className="grid-2 aju-campos">
          <div>
            <label className="etiqueta" htmlFor="aju-edad">Edad</label>
            <input
              id="aju-edad"
              className="input"
              type="text"
              inputMode="numeric"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="aju-altura">Altura (cm)</label>
            <input
              id="aju-altura"
              className="input"
              type="text"
              inputMode="numeric"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primario aju-btn-bloque" onClick={guardarPerfil}>Guardar cambios</button>
      </div>

      <div className="titulo-seccion">Días de entreno</div>
      <div className="panel">
        <div className="aju-dias">
          {DIAS.map(([dia, letra, nombre]) => {
            const activo = estado.ajustes.diasPlanificados.includes(dia)
            return (
              <button
                key={dia}
                className={activo ? 'chip chip-activo aju-dia' : 'chip aju-dia'}
                aria-pressed={activo}
                aria-label={nombre}
                onClick={() => alternarDia(dia)}
              >
                {letra}
              </button>
            )
          })}
        </div>
        <p className="texto-suave aju-nota">
          Solo los días marcados cuentan para la racha; al cambiarlos, se recalcula sola.
          Los días de descanso nunca la rompen.
        </p>
      </div>

      <div className="titulo-seccion">Entreno</div>
      <div className="panel">
        <span className="etiqueta">Descanso entre series por defecto</span>
        <Stepper
          valor={estado.ajustes.descansoSeg}
          paso={15}
          min={15}
          max={600}
          unidad="s"
          onCambiar={cambiarDescanso}
        />
      </div>

      <div className="titulo-seccion">Tus datos</div>
      <div className="panel">
        <button className="btn aju-btn-bloque" onClick={exportar}>⬇️ Exportar copia (.json)</button>
        <label className="btn aju-btn-bloque" htmlFor="aju-input-importar">⬆️ Importar copia</label>
        <input
          id="aju-input-importar"
          className="aju-oculto"
          type="file"
          accept="application/json,.json"
          onChange={alElegirCopia}
        />
        <p className="texto-suave aju-nota">
          La copia incluye todo tu progreso, fotos incluidas. Guárdala donde no se pierda.
        </p>
      </div>

      <div className="titulo-seccion">Sobre la app</div>
      <div className="panel aju-sobre">
        <p><strong>FromZeroToHero</strong> · versión 1</p>
        <p className="texto-suave">El XP nace de lo que haces, nunca de lo que pesas.</p>
        <p className="texto-suave">Compites contra quien eras al empezar, no contra nadie más.</p>
        <p className="texto-suave">Descansar forma parte del camino: la racha respeta tus días libres.</p>
      </div>

      <div className="titulo-seccion aju-titulo-peligro">Zona peligrosa</div>
      <div className="panel aju-peligro">
        <p className="texto-suave aju-nota">
          Borra a tu héroe, tus sesiones, tus fotos y todo tu progreso de este dispositivo.
        </p>
        <button className="btn btn-peligro aju-btn-bloque" onClick={() => setPasoBorrar(1)}>
          Borrar todos los datos
        </button>
      </div>

      {importado && (
        <Modal titulo="Importar copia" abierto onCerrar={() => setImportado(null)}>
          <p>Vas a reemplazar todos los datos actuales por esta copia:</p>
          <ul className="aju-resumen">
            <li>Héroe: <strong>{(importado.estado.perfil && importado.estado.perfil.apodo) || '—'}</strong></li>
            <li>Sesiones: <strong>{importado.estado.sesiones.length}</strong></li>
            <li>XP total: <strong>{importado.estado.progreso.xp}</strong></li>
            <li>Fotos: <strong>{importado.fotos.length}</strong></li>
          </ul>
          <p className="texto-suave">Los datos actuales de este dispositivo se perderán.</p>
          <div className="fila aju-acciones-modal">
            <button className="btn" onClick={() => setImportado(null)}>Cancelar</button>
            <button className="btn btn-peligro" onClick={confirmarImportar}>Reemplazar</button>
          </div>
        </Modal>
      )}

      {pasoBorrar > 0 && (
        <Modal titulo="Borrar todos los datos" abierto onCerrar={cerrarBorrar}>
          {pasoBorrar === 1 ? (
            <>
              <p>Esto borra a tu héroe, tus sesiones, tus fotos y todo tu progreso de este dispositivo. No hay marcha atrás.</p>
              <p className="texto-suave aju-nota">Si quieres conservar algo, exporta una copia antes.</p>
              <div className="fila aju-acciones-modal">
                <button className="btn" onClick={cerrarBorrar}>Cancelar</button>
                <button className="btn btn-peligro" onClick={() => setPasoBorrar(2)}>Continuar</button>
              </div>
            </>
          ) : (
            <>
              <p>Escribe <strong>BORRAR</strong> para confirmar.</p>
              <input
                className="input aju-campo-borrar"
                type="text"
                value={textoBorrar}
                onChange={(e) => setTextoBorrar(e.target.value)}
                placeholder="BORRAR"
                autoCapitalize="characters"
                autoComplete="off"
                aria-label="Escribe BORRAR para confirmar"
              />
              <div className="fila aju-acciones-modal">
                <button className="btn" onClick={cerrarBorrar}>Cancelar</button>
                <button
                  className="btn btn-peligro"
                  disabled={textoBorrar.trim() !== 'BORRAR'}
                  onClick={borrarTodo}
                >
                  Borrar para siempre
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
