import GraficaLinea from './GraficaLinea.jsx'
import MiniEjercicio from './MiniEjercicio.jsx'
import Modal from './Modal.jsx'
import { historicoEjercicio, progresoEjercicio } from '../engine/motor.js'

function fmtNum(v) {
  const r = Math.round(v * 10) / 10
  return (Number.isInteger(r) ? String(r) : r.toFixed(1)).replace('.', ',')
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
      { nombre: 'Mejor peso', color: 'var(--oro)', puntos: datos.map((d) => ({ x: d.fecha, y: d.mejorPesoKg })) },
      { nombre: 'e1RM', color: 'var(--plata)', puntos: datos.filter((d) => d.e1rmKg != null).map((d) => ({ x: d.fecha, y: d.e1rmKg })) },
    ]
  } else if (ejercicio.medida === 'tiempo') {
    unidadMarca = 'min'
    serieMarca = [
      { nombre: 'Mejores minutos', color: 'var(--oro)', puntos: datos.map((d) => ({ x: d.fecha, y: d.mejorMinutos })) },
    ]
  } else {
    unidadMarca = 'reps'
    serieMarca = [
      { nombre: 'Mejores reps', color: 'var(--oro)', puntos: datos.map((d) => ({ x: d.fecha, y: d.mejorReps })) },
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
      nombre: ejercicio.medida === 'peso_reps' ? 'Kilos movidos' : ejercicio.medida === 'tiempo' ? 'Minutos totales' : 'Reps totales',
      color: 'var(--bosque-claro)',
      puntos: totales,
    },
  ]

  return (
    <Modal titulo={ejercicio.nombre} abierto onCerrar={onCerrar}>
      <div className="estej">
        <div className="estej-cab">
          <MiniEjercicio id={ejercicio.id} />
          <div className="prog-resumen estej-chips">
            <span className="chip">Sesiones: {h.vecesHecho}</span>
            {h.mejorPesoKg != null && <span className="chip">Mejor: {fmtNum(h.mejorPesoKg)} kg</span>}
            {h.mejor1rmKg != null && <span className="chip">e1RM: {fmtNum(h.mejor1rmKg)} kg</span>}
            {h.mejorReps != null && <span className="chip">Mejor: {h.mejorReps} reps</span>}
            {h.mejorMinutos != null && <span className="chip">Mejor: {h.mejorMinutos} min</span>}
          </div>
        </div>
        {datos.length === 0 ? (
          <p className="texto-suave estej-vacio">
            Aún no hay registros tuyos de este ejercicio. En cuanto completes
            una serie en un entreno, aquí empezará tu historia.
          </p>
        ) : (
          <>
            <div className="titulo-seccion estej-titulo">Tu marca</div>
            <GraficaLinea series={serieMarca} unidad={unidadMarca} alto={165} />
            {totales.length > 0 && (
              <>
                <div className="titulo-seccion estej-titulo titulo-bosque">Total por sesión</div>
                <GraficaLinea series={serieTotal} unidad={unidadMarca === 'min' ? 'min' : unidadMarca === 'kg' ? 'kg' : 'reps'} alto={150} />
              </>
            )}
            <p className="texto-suave estej-nota">Cada punto es una sesión. La línea sube porque tú subes.</p>
          </>
        )}
      </div>
    </Modal>
  )
}
