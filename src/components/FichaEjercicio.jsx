import Modal from './Modal.jsx'
import { GRUPOS } from '../data/ejercicios.js'
import { fichaDeEjercicio } from '../data/fichas-ejercicios.js'

const NOMBRE_MEDIDA = { peso_reps: 'peso × reps', reps: 'solo reps', tiempo: 'tiempo (min)' }

// Ficha de técnica de un ejercicio: músculos, claves y error típico.
export default function FichaEjercicio({ ejercicio, abierto, onCerrar }) {
  if (!abierto || !ejercicio) return null
  const ficha = fichaDeEjercicio(ejercicio.id)
  const grupo = GRUPOS.find((g) => g.id === ejercicio.grupo)

  return (
    <Modal titulo={ejercicio.nombre} abierto onCerrar={onCerrar}>
      <div className="fej">
        <p className="texto-suave fej-meta">
          {grupo ? grupo.nombre : ejercicio.grupo} · {NOMBRE_MEDIDA[ejercicio.medida] || ejercicio.medida}
        </p>
        {ficha ? (
          <>
            <p className="fej-musculos"><strong className="oro">Trabaja:</strong> {ficha.musculos}</p>
            <ul className="fej-claves">
              {ficha.claves.map((clave, i) => (
                <li key={i}>{clave}</li>
              ))}
            </ul>
            <p className="fej-error"><strong>Ojo:</strong> {ficha.error}</p>
          </>
        ) : (
          <p>Ejercicio forjado por ti: tú marcas la técnica.</p>
        )}
        <p className="texto-suave fej-nota">
          Guías generales: no sustituyen a un entrenador. Ante dolor (que no sean
          agujetas), para y consulta.
        </p>
      </div>
    </Modal>
  )
}
