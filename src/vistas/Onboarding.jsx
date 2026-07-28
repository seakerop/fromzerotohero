import { useEffect, useRef, useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import Deslizador from '../components/Deslizador.jsx'
import StatBarra from '../components/StatBarra.jsx'
import Stepper from '../components/Stepper.jsx'
import { etapaDeNivel } from '../data/etapas.js'

const TOTAL_PASOS = 5

const PASOS_INFO = {
  1: { titulo: 'Tu nombre de héroe', frase: 'Toda leyenda empieza con un nombre.' },
  2: { titulo: 'Tu punto de partida', frase: 'El héroe no elige dónde empieza. Elige avanzar.' },
  3: { titulo: 'Tus hábitos de hoy', frase: 'Sin juicios: solo dibujamos el mapa del territorio.' },
  4: { titulo: 'Tu objetivo', frase: '¿Qué buscas al otro lado del umbral?' },
  5: { titulo: 'Tus días de batalla', frase: 'Elige cuándo entrenas. Descansar también es parte del plan.' },
}

const OPCIONES_PASOS = [
  { id: 'menos3k', texto: 'Menos de 3.000', valor: 2000 },
  { id: '3a6k', texto: '3.000 – 6.000', valor: 4500 },
  { id: '6a10k', texto: '6.000 – 10.000', valor: 8000 },
  { id: 'mas10k', texto: 'Más de 10.000', valor: 12000 },
]

const OPCIONES_EXPERIENCIA = [
  { id: 'ninguna', icono: '🌱', titulo: 'Ninguna', detalle: 'Nunca he entrenado con pesas' },
  { id: 'algo', icono: '🌿', titulo: 'Algo', detalle: 'He entrenado a rachas' },
  { id: 'habitual', icono: '🌳', titulo: 'Habitual', detalle: 'Entreno con regularidad' },
]

const OPCIONES_OBJETIVO = [
  { id: 'perder', icono: '🔥', titulo: 'Perder peso', detalle: 'Constancia y movimiento, a tu ritmo' },
  { id: 'fuerza', icono: '⚔️', titulo: 'Ganar fuerza', detalle: 'Levantar más que ayer' },
  { id: 'ambos', icono: '🛡️', titulo: 'Ambos', detalle: 'El camino completo del héroe' },
]

const DIAS_SEMANA = [
  { iso: 1, letra: 'L', nombre: 'lunes' },
  { iso: 2, letra: 'M', nombre: 'martes' },
  { iso: 3, letra: 'X', nombre: 'miércoles' },
  { iso: 4, letra: 'J', nombre: 'jueves' },
  { iso: 5, letra: 'V', nombre: 'viernes' },
  { iso: 6, letra: 'S', nombre: 'sábado' },
  { iso: 7, letra: 'D', nombre: 'domingo' },
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
        <div className="onb-rev-etapa">{etapa.nombre} · Nivel 1</div>
      </div>
      <p className="onb-rev-lema">{etapa.lema}</p>
      <p className="onb-rev-semilla texto-suave">
        Hoy plantas tu semilla. Crecerá con cada día en que hagas algo —
        entrenar, moverte, registrar — y nunca dará marcha atrás.
        Cuídala con tus días: lo que le pase, te lo contará.
      </p>
      <div className="panel onb-rev-stats">
        <StatBarra nombre="Fuerza" icono="⚔️" valor={fuerza} />
        <StatBarra nombre="Resistencia" icono="🏃" valor={resistencia} />
        <StatBarra nombre="Constancia" icono="🧭" valor={constancia} />
      </div>
      <button type="button" className="btn btn-primario btn-grande onb-rev-boton" onClick={alConfirmar}>
        ⚔️ Empezar el viaje
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
        <div className="onb-titulo-app">⚔️ Forja tu personaje</div>
        <div className="onb-progreso">
          <div className="onb-progreso-relleno" style={{ width: `${(paso / TOTAL_PASOS) * 100}%` }} />
        </div>
        <div className="onb-paso-num">Paso {paso} de {TOTAL_PASOS}</div>
      </header>

      <div className="onb-paso" key={paso}>
        <div>
          <h1 className="onb-paso-titulo">{info.titulo}</h1>
          <p className="onb-frase">«{info.frase}»</p>
        </div>

        {paso === 1 && (
          <div className="onb-campo">
            <label className="etiqueta" htmlFor="onb-apodo">¿Cómo te llamarán en las canciones?</label>
            <input
              id="onb-apodo"
              className="input"
              type="text"
              value={apodo}
              maxLength={20}
              autoFocus
              autoComplete="off"
              placeholder="Tu apodo"
              onChange={(e) => setApodo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') avanzar() }}
            />
            <p className="texto-suave onb-nota">Solo tú lo verás: todo se queda en tu dispositivo.</p>
          </div>
        )}

        {paso === 2 && (
          <>
            <Deslizador etiqueta="Edad" valor={edad} min={14} max={99} paso={1} unidad="años" onCambiar={setEdad} />
            <Deslizador etiqueta="Altura" valor={alturaCm} min={120} max={220} paso={1} unidad="cm" onCambiar={setAlturaCm} />
            <Deslizador etiqueta="Peso actual" valor={pesoKg} min={30} max={250} paso={0.5} unidad="kg" onCambiar={setPesoKg} />
            <p className="texto-suave onb-nota">
              Es tu punto de partida, no tu destino. Aquí solo se celebra lo que haces.
            </p>
          </>
        )}

        {paso === 3 && (
          <>
            <div className="onb-campo">
              <span className="etiqueta">¿Cuántos pasos das al día, más o menos?</span>
              <div className="onb-grid-pasos">
                {OPCIONES_PASOS.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    className={pasosOpcion === opcion.id ? 'onb-carta onb-carta-activa' : 'onb-carta'}
                    onClick={() => elegirPasos(opcion)}
                  >
                    <span className="onb-carta-titulo">{opcion.texto}</span>
                    <span className="onb-carta-detalle">≈ {opcion.valor.toLocaleString('es-ES')} pasos</span>
                  </button>
                ))}
              </div>
            </div>
            {pasosOpcion !== null && (
              <div className="onb-campo">
                <span className="etiqueta">Afina la cifra si quieres</span>
                <Stepper valor={pasosDia} paso={500} min={500} max={40000} unidad="pasos" onCambiar={setPasosDia} />
              </div>
            )}
            <div className="onb-campo">
              <span className="etiqueta">¿Cuántos días haces ejercicio ahora mismo?</span>
              <Stepper valor={diasEjercicioSemana} paso={1} min={0} max={7} unidad="días/semana" onCambiar={setDiasEjercicioSemana} />
            </div>
            <div className="onb-campo">
              <span className="etiqueta">¿Experiencia con pesas?</span>
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
                      <span className="onb-carta-titulo">{opcion.titulo}</span>
                      <span className="onb-carta-detalle">{opcion.detalle}</span>
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
                  <span className="onb-carta-titulo">{opcion.titulo}</span>
                  <span className="onb-carta-detalle">{opcion.detalle}</span>
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
                  aria-label={dia.nombre}
                >
                  {dia.letra}
                </button>
              ))}
            </div>
            <p className="onb-dias-resumen">
              {diasPlanificados.length === 0
                ? 'Sin días elegidos. Puedes marcarlos ahora o más tarde en Ajustes.'
                : diasPlanificados.length === 1
                  ? '1 día de entreno a la semana'
                  : `${diasPlanificados.length} días de entreno a la semana`}
            </p>
            <p className="texto-suave onb-nota">
              La racha solo cuenta los días que elijas: descansar nunca resta.
            </p>
          </>
        )}
      </div>

      <div className="onb-nav">
        {paso > 1 && (
          <button type="button" className="btn btn-fantasma" onClick={() => setPaso(paso - 1)}>
            ← Atrás
          </button>
        )}
        <button type="button" className="btn btn-primario" disabled={!puedeContinuar()} onClick={avanzar}>
          {paso === TOTAL_PASOS ? '⚒️ Forjar personaje' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}
