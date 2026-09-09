import Modal from './Modal.jsx'
import { t } from '../i18n/idioma.js'
import { fichaDe, nombreEjercicio, nombreGrupo } from '../i18n/catalogo.js'

const nombreMedida = (medida) => ({
  peso_reps: t('peso × reps', 'weight × reps'),
  reps: t('solo reps', 'reps only'),
  tiempo: t('tiempo (min)', 'time (min)'),
}[medida] || medida)

// Ficha de técnica de un ejercicio: músculos, claves y error típico.
export default function FichaEjercicio({ ejercicio, abierto, onCerrar }) {
  if (!abierto || !ejercicio) return null
  const ficha = fichaDe(ejercicio.id)

  return (
    <Modal titulo={nombreEjercicio(ejercicio)} abierto onCerrar={onCerrar}>
      <div className="fej">
        <p className="texto-suave fej-meta">
          {nombreGrupo(ejercicio.grupo)} · {nombreMedida(ejercicio.medida)}
        </p>
        {ficha ? (
          <>
            <img
              key={ejercicio.id}
              className="fej-dibujo"
              src={`img/ejercicios/${ejercicio.id}.webp`}
              alt=""
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <p className="fej-musculos"><strong className="oro">{t('Trabaja:', 'Works:')}</strong> {ficha.musculos}</p>
            <ul className="fej-claves">
              {ficha.claves.map((clave, i) => (
                <li key={i}>{clave}</li>
              ))}
            </ul>
            <p className="fej-error"><strong>{t('Ojo:', 'Watch out:')}</strong> {ficha.error}</p>
          </>
        ) : (
          <p>{t('Ejercicio forjado por ti: tú marcas la técnica.', 'An exercise forged by you: you set the technique.')}</p>
        )}
        <p className="texto-suave fej-nota">
          {t(
            'Guías generales: no sustituyen a un entrenador. Ante dolor (que no sean agujetas), para y consulta.',
            'General guidance: no substitute for a coach. If something hurts (beyond soreness), stop and get checked.'
          )}
        </p>
      </div>
    </Modal>
  )
}
