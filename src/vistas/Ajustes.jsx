import { useState } from 'react'
import Deslizador from '../components/Deslizador.jsx'
import Modal from '../components/Modal.jsx'
import Stepper from '../components/Stepper.jsx'
import { claveDia } from '../engine/fechas.js'
import { metaPasosDe } from '../engine/motor.js'
import { borrarBaseDeDatos } from '../db/db.js'
import { exportarJSON, exportarJSONConFotos, importarCopia } from '../db/exportar.js'
import { borrarTodasLasFotos, restaurarFotos, serializarFotos } from '../db/fotos.js'
import { SUPLEMENTOS } from '../data/suplementos.js'
import { t } from '../i18n/idioma.js'
import { avisoSuplementos, nombreSuplemento, suplementoTexto } from '../i18n/catalogo.js'

// [dia ISO, letra es, letra en, nombre es, nombre en]
const DIAS = [
  [1, 'L', 'M', 'lunes', 'Monday'],
  [2, 'M', 'T', 'martes', 'Tuesday'],
  [3, 'X', 'W', 'miércoles', 'Wednesday'],
  [4, 'J', 'T', 'jueves', 'Thursday'],
  [5, 'V', 'F', 'viernes', 'Friday'],
  [6, 'S', 'S', 'sábado', 'Saturday'],
  [7, 'D', 'S', 'domingo', 'Sunday'],
]

function textoEvidencia(evidencia) {
  return evidencia === 'fuerte'
    ? t('evidencia fuerte', 'strong evidence')
    : t('evidencia moderada', 'moderate evidence')
}

export default function Ajustes({ estado, actualizarEstado, avisar }) {
  const [apodo, setApodo] = useState(estado.perfil.apodo)
  const [edad, setEdad] = useState(String(estado.perfil.edad ?? ''))
  const [altura, setAltura] = useState(String(estado.perfil.alturaCm ?? ''))
  const [importado, setImportado] = useState(null)
  const [pasoBorrar, setPasoBorrar] = useState(0)
  const [textoBorrar, setTextoBorrar] = useState('')
  const [nombrePacto, setNombrePacto] = useState('')
  const [fichaSupl, setFichaSupl] = useState(null)

  const pautaSupl = (estado.suplementos && estado.suplementos.pauta) || []
  const idiomaActivo = estado.ajustes.idioma || 'es'
  const palabraBorrar = t('BORRAR', 'DELETE')

  function cambiarIdioma(codigo) {
    actualizarEstado((e) => ({ ...e, ajustes: { ...e.ajustes, idioma: codigo } }))
  }

  function alternarPautaSupl(id) {
    actualizarEstado((prev) => {
      const s = prev.suplementos || { pauta: [], tomas: {} }
      const pauta = s.pauta.includes(id) ? s.pauta.filter((x) => x !== id) : [...s.pauta, id]
      return { ...prev, suplementos: { ...s, pauta } }
    })
  }

  function sellarPacto() {
    const nombre = nombrePacto.trim()
    if (!nombre) {
      avisar(t('Ponle nombre a tu hermano de pacto', 'Give your Pact brother a name'), 'error')
      return
    }
    actualizarEstado((prev) => ({ ...prev, pacto: { nombre, selladoEl: claveDia() } }))
    setNombrePacto('')
    avisar(t(
      `Pacto sellado con ${nombre}. Dos que se levantan a la vez.`,
      `Pact sealed with ${nombre}. Two who rise together.`
    ))
  }

  function deshacerPacto() {
    actualizarEstado((prev) => ({ ...prev, pacto: null }))
    avisar(t('Pacto deshecho, sin rencores.', 'Pact undone, no hard feelings.'))
  }

  function guardarPerfil() {
    const apodoLimpio = apodo.trim()
    const edadNum = Math.round(Number(edad))
    const alturaNum = Math.round(Number(altura))
    if (!apodoLimpio || !(edadNum > 0) || !(alturaNum > 0)) {
      avisar(t('Revisa los datos del perfil', 'Check your profile details'), 'error')
      return
    }
    actualizarEstado((prev) => ({
      ...prev,
      perfil: { ...prev.perfil, apodo: apodoLimpio, edad: edadNum, alturaCm: alturaNum },
    }))
    avisar(t('Perfil actualizado', 'Profile updated'))
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

  function cambiarMetaPasos(pasos) {
    actualizarEstado((prev) => ({
      ...prev,
      ajustes: { ...prev.ajustes, metaPasos: pasos },
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
      avisar(t(
        'Las fotos no cupieron en la copia: se exporta sin ellas',
        'The photos did not fit in the backup: exporting without them'
      ), 'error')
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
        await navigator.share({ files: [archivo], title: t('Copia de FromZeroToHero', 'FromZeroToHero backup') })
        avisar(t(
          'Copia compartida: guárdala en Archivos o donde quieras',
          'Backup shared: save it to Files or wherever you like'
        ))
      } catch (err) {
        if (!err || err.name !== 'AbortError') avisar(t('No se pudo compartir la copia', 'Could not share the backup'), 'error')
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
    avisar(t('Copia descargada', 'Backup downloaded'))
  }

  async function alElegirCopia(ev) {
    const fichero = ev.target.files && ev.target.files[0]
    ev.target.value = ''
    if (!fichero) return
    try {
      const texto = await fichero.text()
      setImportado(importarCopia(texto))
    } catch (err) {
      avisar(err && err.message ? err.message : t('Ese fichero no parece una copia válida', 'That file does not look like a valid backup'), 'error')
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
    avisar(t('Datos importados', 'Data imported'))
  }

  function cerrarBorrar() {
    setPasoBorrar(0)
    setTextoBorrar('')
  }

  async function borrarTodo() {
    cerrarBorrar()
    actualizarEstado(() => null)
    const recargar = () => window.location.reload()
    // Tope de seguridad por si algo se atasca: recargar igualmente.
    const tope = setTimeout(recargar, 4000)
    try {
      await borrarBaseDeDatos()
    } catch {
      // recargamos de todos modos
    }
    clearTimeout(tope)
    recargar()
  }

  return (
    <div className="vista">
      <h1 className="aju-titulo">{t('Ajustes', 'Settings')}</h1>

      <div className="titulo-seccion">Idioma · Language</div>
      <div className="panel">
        <div className="supl-chips">
          <button
            className={idiomaActivo === 'es' ? 'chip chip-activo' : 'chip'}
            aria-pressed={idiomaActivo === 'es'}
            onClick={() => cambiarIdioma('es')}
          >
            Español
          </button>
          <button
            className={idiomaActivo === 'en' ? 'chip chip-activo' : 'chip'}
            aria-pressed={idiomaActivo === 'en'}
            onClick={() => cambiarIdioma('en')}
          >
            English
          </button>
        </div>
      </div>

      <div className="titulo-seccion">{t('Perfil', 'Profile')}</div>
      <div className="panel">
        <label className="etiqueta" htmlFor="aju-apodo">{t('Apodo', 'Nickname')}</label>
        <input
          id="aju-apodo"
          className="input"
          type="text"
          value={apodo}
          onChange={(e) => setApodo(e.target.value)}
        />
        <div className="grid-2 aju-campos">
          <div>
            <label className="etiqueta" htmlFor="aju-edad">{t('Edad', 'Age')}</label>
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
            <label className="etiqueta" htmlFor="aju-altura">{t('Altura (cm)', 'Height (cm)')}</label>
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
        <button className="btn btn-primario aju-btn-bloque" onClick={guardarPerfil}>{t('Guardar cambios', 'Save changes')}</button>
      </div>

      <div className="titulo-seccion">{t('Días de entreno', 'Training days')}</div>
      <div className="panel">
        <div className="aju-dias">
          {DIAS.map(([dia, letraEs, letraEn, nombreEs, nombreEn]) => {
            const activo = estado.ajustes.diasPlanificados.includes(dia)
            return (
              <button
                key={dia}
                className={activo ? 'chip chip-activo aju-dia' : 'chip aju-dia'}
                aria-pressed={activo}
                aria-label={t(nombreEs, nombreEn)}
                onClick={() => alternarDia(dia)}
              >
                {t(letraEs, letraEn)}
              </button>
            )
          })}
        </div>
        <p className="texto-suave aju-nota">
          {t(
            'Solo los días marcados cuentan para la racha; al cambiarlos, se recalcula sola. Los días de descanso nunca la rompen.',
            'Only the marked days count toward your streak; change them and it recalculates on its own. Rest days never break it.'
          )}
        </p>
      </div>

      <div className="titulo-seccion">{t('Entreno', 'Workout')}</div>
      <div className="panel">
        <span className="etiqueta">{t('Descanso entre series por defecto', 'Default rest between sets')}</span>
        <Stepper
          valor={estado.ajustes.descansoSeg}
          paso={15}
          min={15}
          max={600}
          unidad="s"
          onCambiar={cambiarDescanso}
        />
      </div>

      <div className="titulo-seccion titulo-bosque">{t('Pasos', 'Steps')}</div>
      <div className="panel panel-acento-bosque">
        <Deslizador
          etiqueta={t('Meta diaria de pasos', 'Daily step goal')}
          valor={metaPasosDe(estado)}
          min={2000}
          max={20000}
          paso={250}
          onCambiar={cambiarMetaPasos}
        />
        <p className="texto-suave aju-nota">
          {t(
            'Es la barra que llenas cada día: cada cuarto suma XP y completarla suma más. Se sugiere a partir de los pasos que ya das; caminar 7.000-8.000 al día ya recoge casi todo el beneficio en salud, los 10.000 vienen de un anuncio de 1965.',
            'This is the bar you fill each day: every quarter earns XP and completing it earns more. It is suggested from the steps you already take; 7,000-8,000 a day already captures nearly all the health benefit — the famous 10,000 came from a 1965 ad.'
          )}
        </p>
      </div>

      <div className="titulo-seccion">{t('El pacto', 'The Pact')}</div>
      <div className="panel">
        {estado.pacto && estado.pacto.nombre ? (
          <>
            <p className="aju-pacto-sellado">🤝 {t('Pacto sellado con', 'Pact sealed with')} <strong>{estado.pacto.nombre}</strong></p>
            <p className="texto-suave aju-nota">
              {t(
                `Cada domingo, la app te propondrá compartir tu semana con ${estado.pacto.nombre}. Tú decides si la envías: el pacto anima, nunca vigila.`,
                `Every Sunday, the app will offer to share your week with ${estado.pacto.nombre}. You decide whether to send it: the Pact encourages, it never watches.`
              )}
            </p>
            <button className="rut-borrar-enlace" onClick={deshacerPacto}>{t('Deshacer el pacto', 'Undo the Pact')}</button>
          </>
        ) : (
          <>
            <p className="texto-suave aju-nota">
              {t(
                'Dos que se levantan a la vez llegan más lejos. Sella un pacto con tu hermano de armas: cada domingo compartiréis vuestra semana (una imagen, por donde queráis). Nada sale de tu móvil sin que tú lo envíes.',
                'Two who rise together go further. Seal a Pact with your brother in arms: every Sunday you will share your week (one image, through whichever channel you like). Nothing leaves your phone unless you send it.'
              )}
            </p>
            <input
              className="input"
              type="text"
              maxLength={20}
              placeholder={t('Nombre de tu hermano de pacto', "Your Pact brother's name")}
              value={nombrePacto}
              onChange={(ev) => setNombrePacto(ev.target.value)}
              aria-label={t('Nombre de tu hermano de pacto', "Your Pact brother's name")}
            />
            <button className="btn aju-btn-bloque" onClick={sellarPacto} disabled={!nombrePacto.trim()}>
              {t('🤝 Sellar el pacto', '🤝 Seal the Pact')}
            </button>
          </>
        )}
      </div>

      <div className="titulo-seccion">{t('Suplementación', 'Supplements')}</div>
      <div className="panel">
        <p className="texto-suave aju-nota">
          {t(
            'Opcional, y sin XP a propósito: lo que tomas es información tuya, no un juego. Marca «Lo tomo» y podrás apuntarlo cada día desde Inicio.',
            "Optional, and XP-free on purpose: what you take is your own information, not a game. Mark 'I take it' and you can log it each day from Home."
          )}
        </p>
        {SUPLEMENTOS.map((s) => (
          <div key={s.id} className="supl-fila">
            <button className="supl-nombre" onClick={() => setFichaSupl(s)}>
              <span aria-hidden="true">{s.icono}</span> {nombreSuplemento(s)}
              <span className={s.evidencia === 'fuerte' ? 'supl-evid supl-evid-fuerte' : 'supl-evid'}>
                {textoEvidencia(s.evidencia)}
              </span>
            </button>
            <button
              className={pautaSupl.includes(s.id) ? 'chip chip-activo' : 'chip'}
              onClick={() => alternarPautaSupl(s.id)}
              aria-pressed={pautaSupl.includes(s.id)}
            >
              {pautaSupl.includes(s.id) ? `✓ ${t('Lo tomo', 'I take it')}` : t('Lo tomo', 'I take it')}
            </button>
          </div>
        ))}
        <p className="texto-suave supl-aviso">{avisoSuplementos()}</p>
      </div>

      {fichaSupl && (
        <Modal titulo={`${fichaSupl.icono} ${nombreSuplemento(fichaSupl)}`} abierto onCerrar={() => setFichaSupl(null)}>
          <div className="supl-ficha">
            <p className={fichaSupl.evidencia === 'fuerte' ? 'supl-evid supl-evid-fuerte' : 'supl-evid'}>
              {textoEvidencia(fichaSupl.evidencia)}
            </p>
            <p>{suplementoTexto(fichaSupl).que}</p>
            <p><strong className="oro">{t('Dosis:', 'Dose:')}</strong> {suplementoTexto(fichaSupl).dosis}</p>
            <p><strong className="oro">{t('Cuándo:', 'When:')}</strong> {suplementoTexto(fichaSupl).cuando}</p>
            <p><strong>{t('Ojo:', 'Watch out:')}</strong> {suplementoTexto(fichaSupl).ojo}</p>
            <p className="texto-suave supl-aviso">{avisoSuplementos()}</p>
          </div>
        </Modal>
      )}

      <div className="titulo-seccion">{t('Tus datos', 'Your data')}</div>
      <div className="panel">
        <button className="btn aju-btn-bloque" onClick={exportar}>{t('⬇️ Exportar copia (.json)', '⬇️ Export backup (.json)')}</button>
        <label className="btn aju-btn-bloque" htmlFor="aju-input-importar">{t('⬆️ Importar copia', '⬆️ Import backup')}</label>
        <input
          id="aju-input-importar"
          className="aju-oculto"
          type="file"
          accept="application/json,.json"
          onChange={alElegirCopia}
        />
        <p className="texto-suave aju-nota">
          {t(
            'La copia incluye todo tu progreso, fotos incluidas. Guárdala donde no se pierda.',
            'The backup includes all your progress, photos included. Keep it somewhere it will not get lost.'
          )}
        </p>
      </div>

      <div className="titulo-seccion">{t('Sobre la app', 'About the app')}</div>
      <div className="panel aju-sobre">
        <p><strong>FromZeroToHero</strong> · {t('versión 1', 'version 1')}</p>
        <p className="texto-suave">{t('El XP nace de lo que haces, nunca de lo que pesas.', 'XP is born from what you do, never from what you weigh.')}</p>
        <p className="texto-suave">{t('Compites contra quien eras al empezar, no contra nadie más.', 'You compete against who you were when you began, no one else.')}</p>
        <p className="texto-suave">{t('Descansar forma parte del camino: la racha respeta tus días libres.', 'Rest is part of the path: your streak respects your days off.')}</p>
      </div>

      <div className="titulo-seccion aju-titulo-peligro">{t('Zona peligrosa', 'Danger zone')}</div>
      <div className="panel aju-peligro">
        <p className="texto-suave aju-nota">
          {t(
            'Borra a tu héroe, tus sesiones, tus fotos y todo tu progreso de este dispositivo.',
            'Erases your hero, your sessions, your photos, and all your progress from this device.'
          )}
        </p>
        <button className="btn btn-peligro aju-btn-bloque" onClick={() => setPasoBorrar(1)}>
          {t('Borrar todos los datos', 'Delete all data')}
        </button>
      </div>

      {importado && (
        <Modal titulo={t('Importar copia', 'Import backup')} abierto onCerrar={() => setImportado(null)}>
          <p>{t('Vas a reemplazar todos los datos actuales por esta copia:', 'You are about to replace all current data with this backup:')}</p>
          <ul className="aju-resumen">
            <li>{t('Héroe:', 'Hero:')} <strong>{(importado.estado.perfil && importado.estado.perfil.apodo) || '—'}</strong></li>
            <li>{t('Sesiones:', 'Sessions:')} <strong>{importado.estado.sesiones.length}</strong></li>
            <li>{t('XP total:', 'Total XP:')} <strong>{importado.estado.progreso.xp}</strong></li>
            <li>{t('Fotos:', 'Photos:')} <strong>{importado.fotos.length}</strong></li>
          </ul>
          <p className="texto-suave">{t('Los datos actuales de este dispositivo se perderán.', 'The current data on this device will be lost.')}</p>
          <div className="fila aju-acciones-modal">
            <button className="btn" onClick={() => setImportado(null)}>{t('Cancelar', 'Cancel')}</button>
            <button className="btn btn-peligro" onClick={confirmarImportar}>{t('Reemplazar', 'Replace')}</button>
          </div>
        </Modal>
      )}

      {pasoBorrar > 0 && (
        <Modal titulo={t('Borrar todos los datos', 'Delete all data')} abierto onCerrar={cerrarBorrar}>
          {pasoBorrar === 1 ? (
            <>
              <p>{t(
                'Esto borra a tu héroe, tus sesiones, tus fotos y todo tu progreso de este dispositivo. No hay marcha atrás.',
                'This erases your hero, your sessions, your photos, and all your progress from this device. There is no way back.'
              )}</p>
              <p className="texto-suave aju-nota">{t('Si quieres conservar algo, exporta una copia antes.', 'If you want to keep anything, export a backup first.')}</p>
              <div className="fila aju-acciones-modal">
                <button className="btn" onClick={cerrarBorrar}>{t('Cancelar', 'Cancel')}</button>
                <button className="btn btn-peligro" onClick={() => setPasoBorrar(2)}>{t('Continuar', 'Continue')}</button>
              </div>
            </>
          ) : (
            <>
              <p>{t('Escribe', 'Type')} <strong>{palabraBorrar}</strong> {t('para confirmar.', 'to confirm.')}</p>
              <input
                className="input aju-campo-borrar"
                type="text"
                value={textoBorrar}
                onChange={(e) => setTextoBorrar(e.target.value)}
                placeholder={palabraBorrar}
                autoCapitalize="characters"
                autoComplete="off"
                aria-label={t('Escribe BORRAR para confirmar', 'Type DELETE to confirm')}
              />
              <div className="fila aju-acciones-modal">
                <button className="btn" onClick={cerrarBorrar}>{t('Cancelar', 'Cancel')}</button>
                <button
                  className="btn btn-peligro"
                  disabled={textoBorrar.trim() !== palabraBorrar}
                  onClick={borrarTodo}
                >
                  {t('Borrar para siempre', 'Delete forever')}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
