import GraficaLinea from './GraficaLinea.jsx'
import MiniEjercicio from './MiniEjercicio.jsx'
import Modal from './Modal.jsx'
import { historicoEjercicio, progresoEjercicio } from '../engine/motor.js'
import { idioma, t } from '../i18n/idioma.js'
import { nombreEjercicio } from '../i18n/catalogo.js'

function fmtNum(v) {
  const r = Math.round(v * 10) / 10
  const s = Number.isInteger(r) ? String(r) : r.toFixed(1)
  return idioma() === 'en' ? s : s.replace('.', ',')
}

// Ficha de estadísticas PROPIAS de un ejercicio, hermana de la ficha de
// técnica (ⓘ): cómo va tu marca sesión a sesión y cuánto total mueves.
export default function EstadisticasEjercicio({ estado, ejercicio, abierto, onCerrar }) {
  if (!abierto || !ejercicio) return null

  const h = historicoEjercicio(estado, ejercicio.id)
  const datos = progresoEjercicio(estado, ejercicio.id)

  let serieMarca
  let unidadMarca
  if (ejercicio.medida === 'peso_reps') {
    unidadMarca = 'kg'
    serieMarca = [
      { nombre: t('Mejor peso', 'Best weight'), color: 'var(--oro)', puntos: datos.map((d) => ({ x: d.fecha, y: d.mejorPesoKg })) },
      { nombre: 'e1RM', color: 'var(--plata)', puntos: datos.filter((d) => d.e1rmKg != null).map((d) => ({ x: d.fecha, y: d.e1rmKg })) },
    ]
  } else if (ejercicio.medida === 'tiempo') {
    unidadMarca = 'min'
    serieMarca = [
      { nombre: t('Mejores minutos', 'Best minutes'), color: 'var(--oro)', puntos: datos.map((d) => ({ x: d.fecha, y: d.mejorMinutos })) },
    ]
  } else {
    unidadMarca = 'reps'
    serieMarca = [
      { nombre: t('Mejores reps', 'Best reps'), color: 'var(--oro)', puntos: datos.map((d) => ({ x: d.fecha, y: d.mejorReps })) },
    ]
  }

  // Total por sesión: kg movidos (peso × reps de las series hechas) o, en
  // ejercicios sin peso, repeticiones/minutos acumulados.
  const totales = []
  for (const s of estado.sesiones) {
    let total = 0
    let hubo = false
    for (const ej of s.ejercicios) {
      if (ej.ejercicioId !== ejercicio.id) continue
      for (const se of ej.series) {
        if (!se.hecha) continue
        hubo = true
        total += ejercicio.medida === 'peso_reps' ? (se.pesoKg > 0 ? se.pesoKg * se.reps : 0) : se.reps
      }
    }
    if (hubo && total > 0) totales.push({ x: s.fecha, y: total })
  }
  const serieTotal = [
    {
      nombre: ejercicio.medida === 'peso_reps'
        ? t('Kilos movidos', 'Kilos moved')
        : ejercicio.medida === 'tiempo'
          ? t('Minutos totales', 'Total minutes')
          : t('Reps totales', 'Total reps'),
      color: 'var(--bosque-claro)',
      puntos: totales,
    },
  ]

  return (
    <Modal titulo={nombreEjercicio(ejercicio)} abierto onCerrar={onCerrar}>
      <div className="estej">
        <div className="estej-cab">
          <MiniEjercicio id={ejercicio.id} />
          <div className="prog-resumen estej-chips">
            <span className="chip">{t('Sesiones', 'Sessions')}: {h.vecesHecho}</span>
            {h.mejorPesoKg != null && <span className="chip">{t('Mejor', 'Best')}: {fmtNum(h.mejorPesoKg)} kg</span>}
            {h.mejor1rmKg != null && <span className="chip">e1RM: {fmtNum(h.mejor1rmKg)} kg</span>}
            {h.mejorReps != null && <span className="chip">{t('Mejor', 'Best')}: {h.mejorReps} reps</span>}
            {h.mejorMinutos != null && <span className="chip">{t('Mejor', 'Best')}: {h.mejorMinutos} min</span>}
          </div>
        </div>
        {datos.length === 0 ? (
          <p className="texto-suave estej-vacio">
            {t(
              'Aún no hay registros tuyos de este ejercicio. En cuanto completes una serie en un entreno, aquí empezará tu historia.',
              'No entries of yours for this exercise yet. The moment you complete a set in a workout, your story begins here.'
            )}
          </p>
        ) : (
          <>
            <div className="titulo-seccion estej-titulo">{t('Tu marca', 'Your best')}</div>
            <GraficaLinea series={serieMarca} unidad={unidadMarca} alto={165} />
            {totales.length > 0 && (
              <>
                <div className="titulo-seccion estej-titulo titulo-bosque">{t('Total por sesión', 'Total per session')}</div>
                <GraficaLinea series={serieTotal} unidad={unidadMarca === 'min' ? 'min' : unidadMarca === 'kg' ? 'kg' : 'reps'} alto={150} />
              </>
            )}
            <p className="texto-suave estej-nota">
              {t('Cada punto es una sesión. La línea sube porque tú subes.', 'Each point is a session. The line rises because you rise.')}
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
