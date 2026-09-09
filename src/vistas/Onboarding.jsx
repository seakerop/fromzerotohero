import { useEffect, useRef, useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import Deslizador from '../components/Deslizador.jsx'
import StatBarra from '../components/StatBarra.jsx'
import Stepper from '../components/Stepper.jsx'
import { etapaDeNivel } from '../data/etapas.js'
import { localeNum, t } from '../i18n/idioma.js'
import { lemaEtapa, nombreEtapa } from '../i18n/catalogo.js'

const TOTAL_PASOS = 5

// Textos como funciones para que t() se evalúe en cada render (patrón TabBar).
const PASOS_INFO = {
  1: {
    titulo: () => t('Tu nombre de héroe', 'Your hero name'),
    frase: () => t('Toda leyenda empieza con un nombre.', 'Every legend begins with a name.'),
  },
  2: {
    titulo: () => t('Tu punto de partida', 'Your starting point'),
    frase: () => t('El héroe no elige dónde empieza. Elige avanzar.', 'The hero does not choose where they begin. They choose to move forward.'),
  },
  3: {
    titulo: () => t('Tus hábitos de hoy', 'Your habits today'),
    frase: () => t('Sin juicios: solo dibujamos el mapa del territorio.', 'No judgment: we are only drawing the map of the territory.'),
  },
  4: {
    titulo: () => t('Tu objetivo', 'Your goal'),
    frase: () => t('¿Qué buscas al otro lado del umbral?', 'What do you seek beyond the threshold?'),
  },
  5: {
    titulo: () => t('Tus días de batalla', 'Your battle days'),
    frase: () => t('Elige cuándo entrenas. Descansar también es parte del plan.', 'Choose when you train. Rest is part of the plan too.'),
  },
}

const OPCIONES_PASOS = [
  { id: 'menos3k', texto: () => t('Menos de 3.000', 'Under 3,000'), valor: 2000 },
  { id: '3a6k', texto: () => t('3.000 – 6.000', '3,000 – 6,000'), valor: 4500 },
  { id: '6a10k', texto: () => t('6.000 – 10.000', '6,000 – 10,000'), valor: 8000 },
  { id: 'mas10k', texto: () => t('Más de 10.000', 'Over 10,000'), valor: 12000 },
]

const OPCIONES_EXPERIENCIA = [
  { id: 'ninguna', icono: '🌱', titulo: () => t('Ninguna', 'None'), detalle: () => t('Nunca he entrenado con pesas', 'Never trained with weights') },
  { id: 'algo', icono: '🌿', titulo: () => t('Algo', 'Some'), detalle: () => t('He entrenado a rachas', 'I have trained on and off') },
  { id: 'habitual', icono: '🌳', titulo: () => t('Habitual', 'Regular'), detalle: () => t('Entreno con regularidad', 'I train regularly') },
]

const OPCIONES_OBJETIVO = [
  { id: 'perder', icono: '🔥', titulo: () => t('Perder peso', 'Lose weight'), detalle: () => t('Constancia y movimiento, a tu ritmo', 'Consistency and movement, at your pace') },
  { id: 'fuerza', icono: '⚔️', titulo: () => t('Ganar fuerza', 'Gain strength'), detalle: () => t('Levantar más que ayer', 'Lift more than yesterday') },
  { id: 'ambos', icono: '🛡️', titulo: () => t('Ambos', 'Both'), detalle: () => t('El camino completo del héroe', "The hero's full path") },
]

const DIAS_SEMANA = [
  { iso: 1, letra: () => t('L', 'M'), nombre: () => t('lunes', 'Monday') },
  { iso: 2, letra: () => t('M', 'T'), nombre: () => t('martes', 'Tuesday') },
  { iso: 3, letra: () => t('X', 'W'), nombre: () => t('miércoles', 'Wednesday') },
  { iso: 4, letra: () => t('J', 'T'), nombre: () => t('jueves', 'Thursday') },
  { iso: 5, letra: () => t('V', 'F'), nombre: () => t('viernes', 'Friday') },
  { iso: 6, letra: () => t('S', 'S'), nombre: () => t('sábado', 'Saturday') },
  { iso: 7, letra: () => t('D', 'S'), nombre: () => t('domingo', 'Sunday') },
]

// Misma tabla que statsActuales del motor (CONTRACT.md §10), aquí solo para
// la revelación del personaje: aún no existe estado que consultar.
function statsIniciales({ experiencia, pasosDia, diasEjercicioSemana }) {
  const fuerza = experiencia === 'habitual' ? 20 : experiencia === 'algo' ? 12 : 5
  const resistencia = pasosDia >= 10000 ? 22 : pasosDia >= 6000 ? 16 : pasosDia >= 3000 ? 10 : 5
  const constancia = diasEjercicioSemana >= 5 ? 22 : diasEjercicioSemana >= 3 ? 16 : diasEjercicioSemana >= 1 ? 10 : 5
  return { fuerza, resistencia, constancia }
}

function useConteo(objetivo, retrasoMs) {
  const [valor, setValor] = useState(0)
  useEffect(() => {
    let raf = 0
    let inicio = null
    const duracion = 900
    const temporizador = setTimeout(() => {
      function tic(t) {
        if (inicio === null) inicio = t
        const p = Math.min(1, (t - inicio) / duracion)
        setValor(Math.round(objetivo * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(tic)
      }
      raf = requestAnimationFrame(tic)
    }, retrasoMs)
    return () => {
      clearTimeout(temporizador)
      cancelAnimationFrame(raf)
    }
  }, [objetivo, retrasoMs])
  return valor
}

function Revelacion({ apodo, stats, alConfirmar }) {
  const etapa = etapaDeNivel(1)
  const fuerza = useConteo(stats.fuerza, 500)
  const resistencia = useConteo(stats.resistencia, 850)
  const constancia = useConteo(stats.constancia, 1200)
  return (
    <div className="onb-revelacion">
      <div className="onb-rev-avatar">
        <Avatar dias={1} tam={170} />
      </div>
      <div>
        <h1 className="onb-rev-nombre">{apodo}</h1>
        <div className="onb-rev-etapa">{nombreEtapa(etapa)} · {t('Nivel', 'Level')} 1</div>
      </div>
      <p className="onb-rev-lema">{lemaEtapa(etapa)}</p>
      <p className="onb-rev-semilla texto-suave">
        {t(
          'Hoy plantas tu semilla. Crecerá con cada día en que hagas algo — entrenar, moverte, registrar — y nunca dará marcha atrás. Cuídala con tus días: lo que le pase, te lo contará.',
          'Today you plant your seed. It will grow with every day you do something — train, move, log — and it will never turn back. Tend it with your days: whatever happens to it, it will tell you.'
        )}
      </p>
      <div className="panel onb-rev-stats">
        <StatBarra nombre={t('Fuerza', 'Strength')} icono="⚔️" valor={fuerza} />
        <StatBarra nombre={t('Resistencia', 'Endurance')} icono="🏃" valor={resistencia} />
        <StatBarra nombre={t('Constancia', 'Consistency')} icono="🧭" valor={constancia} />
      </div>
      <button type="button" className="btn btn-primario btn-grande onb-rev-boton" onClick={alConfirmar}>
        {t('⚔️ Empezar el viaje', '⚔️ Begin the journey')}
      </button>
    </div>
  )
}

export default function Onboarding({ alTerminar }) {
  const [paso, setPaso] = useState(1)
  const [apodo, setApodo] = useState('')
  const [edad, setEdad] = useState(30)
  const [alturaCm, setAlturaCm] = useState(175)
  const [pesoKg, setPesoKg] = useState(85)
  const [pasosOpcion, setPasosOpcion] = useState(null)
  const [pasosDia, setPasosDia] = useState(4500)
  const [diasEjercicioSemana, setDiasEjercicioSemana] = useState(0)
  const [experiencia, setExperiencia] = useState(null)
  const [objetivo, setObjetivo] = useState(null)
  const [diasPlanificados, setDiasPlanificados] = useState([])
  const enviado = useRef(false)

  function puedeContinuar() {
    if (paso === 1) return apodo.trim().length > 0
    if (paso === 3) return pasosOpcion !== null && experiencia !== null
    if (paso === 4) return objetivo !== null
    return true
  }

  function avanzar() {
    if (puedeContinuar()) setPaso(paso + 1)
  }

  function elegirPasos(opcion) {
    setPasosOpcion(opcion.id)
    setPasosDia(opcion.valor)
  }

  function alternarDia(iso) {
    setDiasPlanificados((previos) =>
      previos.includes(iso) ? previos.filter((d) => d !== iso) : [...previos, iso]
    )
  }

  function confirmar() {
    if (enviado.current) return
    enviado.current = true
    alTerminar({
      apodo: apodo.trim(),
      edad,
      alturaCm,
      pesoKg,
      objetivo,
      experiencia,
      pasosDia,
      diasEjercicioSemana,
      diasPlanificados: [...diasPlanificados].sort((a, b) => a - b),
    })
  }

  if (paso > TOTAL_PASOS) {
    return (
      <div className="onb">
        <Revelacion
          apodo={apodo.trim()}
          stats={statsIniciales({ experiencia, pasosDia, diasEjercicioSemana })}
          alConfirmar={confirmar}
        />
      </div>
    )
  }

  const info = PASOS_INFO[paso]

  return (
    <div className="onb">
      <header className="onb-cabecera">
        <div className="onb-titulo-app">{t('⚔️ Forja tu personaje', '⚔️ Forge your character')}</div>
        <div className="onb-progreso">
          <div className="onb-progreso-relleno" style={{ width: `${(paso / TOTAL_PASOS) * 100}%` }} />
        </div>
        <div className="onb-paso-num">{t('Paso', 'Step')} {paso} {t('de', 'of')} {TOTAL_PASOS}</div>
      </header>

      <div className="onb-paso" key={paso}>
        <div>
          <h1 className="onb-paso-titulo">{info.titulo()}</h1>
          <p className="onb-frase">«{info.frase()}»</p>
        </div>

        {paso === 1 && (
          <div className="onb-campo">
            <label className="etiqueta" htmlFor="onb-apodo">{t('¿Cómo te llamarán en las canciones?', 'What will they call you in the songs?')}</label>
            <input
              id="onb-apodo"
              className="input"
              type="text"
              value={apodo}
              maxLength={20}
              autoFocus
              autoComplete="off"
              placeholder={t('Tu apodo', 'Your nickname')}
              onChange={(e) => setApodo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') avanzar() }}
            />
            <p className="texto-suave onb-nota">{t('Solo tú lo verás: todo se queda en tu dispositivo.', 'Only you will see it: everything stays on your device.')}</p>
          </div>
        )}

        {paso === 2 && (
          <>
            <Deslizador etiqueta={t('Edad', 'Age')} valor={edad} min={14} max={99} paso={1} unidad={t('años', 'years')} onCambiar={setEdad} />
            <Deslizador etiqueta={t('Altura', 'Height')} valor={alturaCm} min={120} max={220} paso={1} unidad="cm" onCambiar={setAlturaCm} />
            <Deslizador etiqueta={t('Peso actual', 'Current weight')} valor={pesoKg} min={30} max={250} paso={0.5} unidad="kg" onCambiar={setPesoKg} />
            <p className="texto-suave onb-nota">
              {t(
                'Es tu punto de partida, no tu destino. Aquí solo se celebra lo que haces.',
                'It is your starting point, not your destiny. Here, only what you do is celebrated.'
              )}
            </p>
          </>
        )}

        {paso === 3 && (
          <>
            <div className="onb-campo">
              <span className="etiqueta">{t('¿Cuántos pasos das al día, más o menos?', 'Roughly how many steps do you take a day?')}</span>
              <div className="onb-grid-pasos">
                {OPCIONES_PASOS.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    className={pasosOpcion === opcion.id ? 'onb-carta onb-carta-activa' : 'onb-carta'}
                    onClick={() => elegirPasos(opcion)}
                  >
                    <span className="onb-carta-titulo">{opcion.texto()}</span>
                    <span className="onb-carta-detalle">≈ {opcion.valor.toLocaleString(localeNum())} {t('pasos', 'steps')}</span>
                  </button>
                ))}
              </div>
            </div>
            {pasosOpcion !== null && (
              <div className="onb-campo">
                <span className="etiqueta">{t('Afina la cifra si quieres', 'Fine-tune the number if you like')}</span>
                <Stepper valor={pasosDia} paso={500} min={500} max={40000} unidad={t('pasos', 'steps')} onCambiar={setPasosDia} />
              </div>
            )}
            <div className="onb-campo">
              <span className="etiqueta">{t('¿Cuántos días haces ejercicio ahora mismo?', 'How many days do you exercise right now?')}</span>
              <Stepper valor={diasEjercicioSemana} paso={1} min={0} max={7} unidad={t('días/semana', 'days/week')} onCambiar={setDiasEjercicioSemana} />
            </div>
            <div className="onb-campo">
              <span className="etiqueta">{t('¿Experiencia con pesas?', 'Experience with weights?')}</span>
              <div className="onb-cartas">
                {OPCIONES_EXPERIENCIA.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    className={experiencia === opcion.id ? 'onb-carta onb-carta-activa' : 'onb-carta'}
                    onClick={() => setExperiencia(opcion.id)}
                  >
                    <span className="onb-carta-icono" aria-hidden="true">{opcion.icono}</span>
                    <span>
                      <span className="onb-carta-titulo">{opcion.titulo()}</span>
                      <span className="onb-carta-detalle">{opcion.detalle()}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {paso === 4 && (
          <div className="onb-cartas">
            {OPCIONES_OBJETIVO.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className={objetivo === opcion.id ? 'onb-carta onb-carta-activa' : 'onb-carta'}
                onClick={() => setObjetivo(opcion.id)}
              >
                <span className="onb-carta-icono" aria-hidden="true">{opcion.icono}</span>
                <span>
                  <span className="onb-carta-titulo">{opcion.titulo()}</span>
                  <span className="onb-carta-detalle">{opcion.detalle()}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {paso === 5 && (
          <>
            <div className="onb-dias">
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia.iso}
                  type="button"
                  className={diasPlanificados.includes(dia.iso) ? 'chip chip-activo onb-dia' : 'chip onb-dia'}
                  onClick={() => alternarDia(dia.iso)}
                  aria-pressed={diasPlanificados.includes(dia.iso)}
                  aria-label={dia.nombre()}
                >
                  {dia.letra()}
                </button>
              ))}
            </div>
            <p className="onb-dias-resumen">
              {diasPlanificados.length === 0
                ? t('Sin días elegidos. Puedes marcarlos ahora o más tarde en Ajustes.', 'No days chosen. You can mark them now or later in Settings.')
                : diasPlanificados.length === 1
                  ? t('1 día de entreno a la semana', '1 workout day a week')
                  : t(`${diasPlanificados.length} días de entreno a la semana`, `${diasPlanificados.length} workout days a week`)}
            </p>
            <p className="texto-suave onb-nota">
              {t(
                'La racha solo cuenta los días que elijas: descansar nunca resta.',
                'The streak only counts the days you choose: resting never subtracts.'
              )}
            </p>
          </>
        )}
      </div>

      <div className="onb-nav">
        {paso > 1 && (
          <button type="button" className="btn btn-fantasma" onClick={() => setPaso(paso - 1)}>
            {t('← Atrás', '← Back')}
          </button>
        )}
        <button type="button" className="btn btn-primario" disabled={!puedeContinuar()} onClick={avanzar}>
          {paso === TOTAL_PASOS ? t('⚒️ Forjar personaje', '⚒️ Forge character') : t('Continuar', 'Continue')}
        </button>
      </div>
    </div>
  )
}
