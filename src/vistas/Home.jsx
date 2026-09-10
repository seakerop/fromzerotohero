import { useRef, useState } from 'react'
import Avatar, {
  MOMENTOS_ARBOL,
  proximoMomento,
  estacionDeMes,
} from '../components/Avatar.jsx'
import BarraXP from '../components/BarraXP.jsx'
import { IconoEntreno, IconoRacha } from '../components/Iconos.jsx'
import Modal from '../components/Modal.jsx'
import StatBarra from '../components/StatBarra.jsx'
import TarjetaGesta, { compartirTarjeta } from '../components/TarjetaGesta.jsx'
import { claveDia, claveSemana, diaISO, sumarDias, formatearFecha } from '../engine/fechas.js'
import {
  nivelDesdeXp,
  statsActuales,
  calcularRacha,
  diasCamino as diasCaminoDe,
  etapaArbol,
  metaPasosDe,
  siguienteEtapaArbol,
  tramosDePasos,
} from '../engine/motor.js'
import { logroPorId } from '../data/logros.js'
import { medidaDeMeta, metaMasCercana, nombreDeMeta } from '../engine/metas.js'
import MiniEjercicio from '../components/MiniEjercicio.jsx'
import { suplementoPorId } from '../data/suplementos.js'
import { idioma, localeNum, t } from '../i18n/idioma.js'
import {
  descEtapaArbol,
  descLogro,
  momentoTexto,
  nombreEtapa,
  nombreEtapaArbol,
  nombreLogro,
  nombreSuplemento,
} from '../i18n/catalogo.js'

const LETRAS_DIA_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const LETRAS_DIA_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const NOMBRE_ESTACION = {
  primavera: ['primavera', 'spring'],
  verano: ['verano', 'summer'],
  otono: ['otoño', 'autumn'],
  invierno: ['invierno', 'winter'],
}

export default function Home({ estado, actualizarEstado, aplicarEvento, irA, avisar, susurro, cerrarSusurro }) {
  const [textoPasos, setTextoPasos] = useState('')
  const [textoPeso, setTextoPeso] = useState('')
  const [fichaAbierta, setFichaAbierta] = useState(false)
  const [modalAyer, setModalAyer] = useState(false)
  const [textoPasosAyer, setTextoPasosAyer] = useState('')
  const [textoPesoAyer, setTextoPesoAyer] = useState('')
  const [modalGesta, setModalGesta] = useState(false)
  const refGesta = useRef(null)

  const hoy = claveDia()
  const nv = nivelDesdeXp(estado.progreso.xp)
  const stats = statsActuales(estado)
  const racha = calcularRacha(estado, hoy)
  // Marca de agua: los días del camino nunca retroceden (ni borrando sesiones).
  const diasCamino = diasCaminoDe(estado)
  const etapaDelArbol = etapaArbol(diasCamino)
  const siguienteArbol = siguienteEtapaArbol(diasCamino)

  const etiquetaXp = nv.xpParaSubir === null
    ? t(`Nv ${nv.nivel} · Nivel máximo`, `Lv ${nv.nivel} · Max level`)
    : `${t('Nv', 'Lv')} ${nv.nivel} · ${nv.xpEnNivel}/${nv.xpParaSubir} XP`

  const lunes = sumarDias(hoy, 1 - diaISO(hoy))
  const fechasConSesion = new Set(estado.sesiones.map((s) => s.fecha))
  const planificados = new Set(estado.ajustes.diasPlanificados)
  const LETRAS_DIA = idioma() === 'en' ? LETRAS_DIA_EN : LETRAS_DIA_ES
  const semana = LETRAS_DIA.map((letra, i) => {
    const fecha = sumarDias(lunes, i)
    return {
      letra,
      fecha,
      plan: planificados.has(i + 1),
      hecho: fechasConSesion.has(fecha),
      esHoy: fecha === hoy,
    }
  })

  const pasosHoy = estado.pasos.find((p) => p.fecha === hoy) || null
  // Barra de pasos: el esfuerzo real llena la barra por cuartos (CONTRACT §8).
  const metaPasos = metaPasosDe(estado)
  const pasosDeHoy = pasosHoy ? pasosHoy.pasos : 0
  const pctPasos = Math.min(100, Math.round((pasosDeHoy / metaPasos) * 100))
  const tramosHoy = tramosDePasos(pasosDeHoy, metaPasos)
  const pesoHoy = estado.cuerpo.pesos.find((p) => p.fecha === hoy) || null

  const ayer = sumarDias(hoy, -1)
  const pasosAyer = estado.pasos.find((p) => p.fecha === ayer) || null
  const pesoAyer = estado.cuerpo.pesos.find((p) => p.fecha === ayer) || null

  // Suplementación: seguimiento informativo puro, SIN XP (como la báscula).
  const pautaSupl = (estado.suplementos && estado.suplementos.pauta) || []
  const tomas = (estado.suplementos && estado.suplementos.tomas) || {}

  // «Hoy toca» / «Próxima gesta»: el siguiente día de la rutina en rotación
  // (el que va después del último entrenado). En días planificados anima;
  // en días de descanso solo informa — nunca empuja.
  let hoyToca = null
  if (!estado.sesionActiva) {
    const ultima = [...estado.sesiones].reverse().find((s) => s.rutinaId)
    let rutina = (ultima && estado.rutinas.find((r) => r.id === ultima.rutinaId)) || null
    if (!rutina || rutina.dias.length === 0) rutina = estado.rutinas.find((r) => r.dias.length > 0) || null
    if (rutina) {
      let dia = rutina.dias[0]
      if (ultima && ultima.rutinaId === rutina.id) {
        const i = rutina.dias.findIndex((d) => d.id === ultima.diaId)
        if (i >= 0) dia = rutina.dias[(i + 1) % rutina.dias.length]
      }
      if (dia.ejercicios.length > 0) {
        hoyToca = { dia, esHoy: estado.ajustes.diasPlanificados.includes(diaISO(hoy)) }
      }
    }
  }

  // Meta activa más cercana a cumplirse: una línea serena, sin cuenta atrás.
  const cercana = metaMasCercana(estado)
  let lineaMeta = null
  if (cercana) {
    const nombreMeta = nombreDeMeta(estado, cercana.meta)
    if (cercana.st.actual == null) {
      lineaMeta = t(`🎯 Meta en marcha: ${nombreMeta}`, `🎯 Goal under way: ${nombreMeta}`)
    } else {
      const falta = Math.round(Math.abs(cercana.meta.objetivo - cercana.st.actual) * 10) / 10
      const faltaTxt = idioma() === 'en' ? String(falta) : String(falta).replace('.', ',')
      const unidadMeta = medidaDeMeta(estado, cercana.meta)
      lineaMeta = t(
        `🎯 A ${faltaTxt} ${unidadMeta} de tu meta: ${nombreMeta}`,
        `🎯 ${faltaTxt} ${unidadMeta} away from your goal: ${nombreMeta}`
      )
    }
  }
  const tomasHoy = tomas[hoy] || []
  const adherencia = pautaSupl.length > 0
    ? Array.from({ length: 7 }, (_, i) => {
        const fecha = sumarDias(hoy, i - 6)
        const dia = tomas[fecha] || []
        const completos = pautaSupl.filter((id) => dia.includes(id)).length
        return completos === pautaSupl.length ? 'todo' : completos > 0 ? 'algo' : 'nada'
      })
    : []

  function alternarSuplemento(id) {
    actualizarEstado((prev) => {
      const s = prev.suplementos || { pauta: [], tomas: {} }
      const lista = s.tomas[hoy] || []
      const nueva = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]
      return { ...prev, suplementos: { ...s, tomas: { ...s.tomas, [hoy]: nueva } } }
    })
  }

  // Domingo de pacto: propuesta serena, una vez, y desaparece sola el lunes.
  const pacto = estado.pacto && estado.pacto.nombre ? estado.pacto : null
  const esDomingoDePacto = Boolean(
    pacto && diaISO(hoy) === 7 && pacto.ultimoAvisoSemana !== claveSemana(hoy)
  )

  function abrirGesta(desdeAviso) {
    setModalGesta(true)
    if (desdeAviso && pacto) {
      // Apaga el aviso de esta semana (edición directa, sin XP).
      actualizarEstado((prev) => ({
        ...prev,
        pacto: { ...prev.pacto, ultimoAvisoSemana: claveSemana(hoy) },
      }))
    }
  }

  const ultimosLogros = Object.entries(estado.progreso.logros)
    .map(([id, fecha]) => ({ logro: logroPorId(id), fecha }))
    .filter((x) => x.logro)
    .reverse()
    .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
    .slice(0, 3)

  function guardarPasos() {
    const n = parseInt(textoPasos.replace(/[.\s]/g, ''), 10)
    if (!Number.isFinite(n) || n < 0 || n > 200000) {
      avisar(t('Introduce un número de pasos válido', 'Enter a valid step count'), 'error')
      return
    }
    const resultados = aplicarEvento({ tipo: 'pasos', fecha: hoy, pasos: n, fuente: 'manual' })
    if (!resultados.some((r) => r.tipo === 'xp')) avisar(t('Pasos de hoy actualizados', "Today's steps updated"), 'info')
    setTextoPasos('')
  }

  function guardarPeso() {
    const n = parseFloat(textoPeso.replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0 || n > 400) {
      avisar(t('Introduce un peso válido en kg', 'Enter a valid weight in kg'), 'error')
      return
    }
    const kg = Math.round(n * 10) / 10
    const resultados = aplicarEvento({ tipo: 'peso', fecha: hoy, kg })
    if (!resultados.some((r) => r.tipo === 'xp')) avisar(t('Peso de hoy actualizado', "Today's weight updated"), 'info')
    setTextoPeso('')
  }

  // Registrar el AYER que se te olvidó: mismo motor, misma dedup de XP, solo
  // cambia la fecha. Únicamente ayer — el pasado lejano no se reconstruye.
  function guardarPasosAyer() {
    const n = parseInt(textoPasosAyer.replace(/[.\s]/g, ''), 10)
    if (!Number.isFinite(n) || n < 0 || n > 200000) {
      avisar(t('Introduce un número de pasos válido', 'Enter a valid step count'), 'error')
      return
    }
    const resultados = aplicarEvento({ tipo: 'pasos', fecha: ayer, pasos: n, fuente: 'manual' })
    if (!resultados.some((r) => r.tipo === 'xp')) avisar(t('Pasos de ayer actualizados', "Yesterday's steps updated"), 'info')
    setTextoPasosAyer('')
  }

  function guardarPesoAyer() {
    const n = parseFloat(textoPesoAyer.replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0 || n > 400) {
      avisar(t('Introduce un peso válido en kg', 'Enter a valid weight in kg'), 'error')
      return
    }
    const kg = Math.round(n * 10) / 10
    const resultados = aplicarEvento({ tipo: 'peso', fecha: ayer, kg })
    if (!resultados.some((r) => r.tipo === 'xp')) avisar(t('Peso de ayer actualizado', "Yesterday's weight updated"), 'info')
    setTextoPesoAyer('')
  }

  return (
    <div className="vista">
      {estado.sesionActiva && (
        <div className="home-sesion">
          <span className="home-sesion-punto" aria-hidden="true" />
          <div className="home-sesion-texto">
            <strong>{t('Sesión en curso', 'Session in progress')}</strong>
            <div className="texto-suave">{estado.sesionActiva.nombreDia}</div>
          </div>
          <button type="button" className="btn" onClick={() => irA('entreno')}>
            {t('Continuar', 'Continue')}
          </button>
        </div>
      )}

      <section className="panel panel-acento-oro">
        <div className="home-carta">
          <button
            type="button"
            className="home-avatar-boton"
            onClick={() => setFichaAbierta(true)}
            aria-label={t('Ver la ficha de tu árbol', 'View your tree')}
          >
            <Avatar dias={diasCamino} tam={104} />
          </button>
          <div className="home-carta-info">
            <h1 className="home-apodo">{estado.perfil.apodo}</h1>
            <div className="home-etapa">{nombreEtapa(nv.etapa)} · {t('Nivel', 'Level')} {nv.nivel}</div>
            <BarraXP progreso={nv.progreso} etiqueta={etiquetaXp} />
            <div className="home-arbol-linea texto-suave" title={descEtapaArbol(etapaDelArbol)}>
              🌱 {nombreEtapaArbol(etapaDelArbol)} · {t(`día ${diasCamino} del camino`, `day ${diasCamino} of the path`)}
              {siguienteArbol ? t(` · crece el día ${siguienteArbol.dias}`, ` · grows on day ${siguienteArbol.dias}`) : ''}
            </div>
          </div>
        </div>
      </section>

      {susurro && (
        <button type="button" className="home-susurro" onClick={cerrarSusurro}>
          <span className="home-susurro-icono" aria-hidden="true">🌿</span>
          <span className="home-susurro-cuerpo">
            {susurro.lineas.map((linea, i) => (
              <span key={i} className="home-susurro-linea">{linea}</span>
            ))}
          </span>
        </button>
      )}

      {fichaAbierta && (
        <Modal titulo={t('Tu árbol', 'Your tree')} abierto onCerrar={() => setFichaAbierta(false)}>
          <div className="ficha-arbol">
            <Avatar dias={diasCamino} tam={160} />
            <div>
              <div className="ficha-etapa">{nombreEtapaArbol(etapaDelArbol)}</div>
              <p className="ficha-lema">«{descEtapaArbol(etapaDelArbol)}»</p>
            </div>
            <div className="ficha-datos">
              {t(`Día ${diasCamino} del camino`, `Day ${diasCamino} of the path`)}
              {proximoMomento(diasCamino) &&
                t(` · próximo brote: día ${proximoMomento(diasCamino).dia}`, ` · next bud: day ${proximoMomento(diasCamino).dia}`)}
              <br />
              {t(
                `Ahora es ${NOMBRE_ESTACION[estacionDeMes(new Date().getMonth() + 1)][0]}: la estación real viste tu árbol.`,
                `It is ${NOMBRE_ESTACION[estacionDeMes(new Date().getMonth() + 1)][1]} now: the real season dresses your tree.`
              )}
            </div>
            <p className="ficha-como">
              {t(
                'Crece con tus días de acción: días en los que entrenas, caminas o registras. Máximo un día por día real, sin atajos. Y nunca retrocede: si faltas, te espera.',
                'It grows with your action days: days when you train, walk, or log. One day per real day at most, no shortcuts. And it never recedes: if you miss, it waits.'
              )}
            </p>
            <h3 className="titulo-seccion ficha-titulo">{t('Crónica', 'Chronicle')}</h3>
            <div className="ficha-cronica">
              {MOMENTOS_ARBOL.map((m) => {
                const hecho = m.dia <= diasCamino
                return (
                  <div key={m.dia} className={hecho ? 'ficha-momento hecho' : 'ficha-momento'}>
                    <span>
                      <span className="ficha-check" aria-hidden="true">{hecho ? '✓ ' : '· '}</span>
                      {momentoTexto(m).etiqueta}
                    </span>
                    <span className="ficha-dia">{t(`día ${m.dia}`, `day ${m.dia}`)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Modal>
      )}

      {hoyToca && (
        <>
          <h2 className="titulo-seccion titulo-bosque">{hoyToca.esHoy ? t('Hoy toca', "Today's quest") : t('Próxima gesta', 'Next quest')}</h2>
          <button type="button" className="panel panel-acento-bosque home-hoytoca" onClick={() => irA('entreno')}>
            <span className="tira-minis">
              {hoyToca.dia.ejercicios.slice(0, 8).map((x) => (
                <MiniEjercicio key={x.ejercicioId} chica id={x.ejercicioId} />
              ))}
            </span>
            <span className="texto-suave home-hoytoca-texto">
              {hoyToca.dia.nombre || t('Entreno', 'Workout')} · {hoyToca.dia.ejercicios.length}{' '}
              {hoyToca.dia.ejercicios.length === 1
                ? (hoyToca.esHoy ? t('gesta te espera hoy', 'feat awaits you today') : t('gesta para cuando vuelvas', 'feat for when you return'))
                : (hoyToca.esHoy ? t('gestas te esperan hoy', 'feats await you today') : t('gestas para cuando vuelvas', 'feats for when you return'))}
            </span>
          </button>
        </>
      )}

      <h2 className="titulo-seccion titulo-acero">{t('Atributos', 'Attributes')}</h2>
      <section className="panel panel-acento-acero">
        <StatBarra nombre={t('Fuerza', 'Strength')} icono="⚔️" valor={stats.fuerza} tono="forja" />
        <StatBarra nombre={t('Resistencia', 'Endurance')} icono="🏃" valor={stats.resistencia} tono="bosque" />
        <StatBarra nombre={t('Constancia', 'Consistency')} icono="🧭" valor={stats.constancia} tono="acero" />
      </section>

      <h2 className="titulo-seccion titulo-brasa">{t('Racha', 'Streak')}</h2>
      <section className="panel panel-acento-brasa">
        <div className="home-racha-cab">
          <span className="home-racha-num"><IconoRacha tam={20} /> {racha}</span>
          <span>{racha === 1 ? t('día de racha', 'day streak') : t('días de racha', 'day streak')}</span>
          {estado.progreso.rachaMejor > 0 && (
            <span className="texto-suave home-racha-mejor">{t('Mejor', 'Best')}: {estado.progreso.rachaMejor}</span>
          )}
        </div>
        {estado.ajustes.diasPlanificados.length > 0 ? (
          <div className="home-dias">
            {semana.map((dia) => (
              <div
                key={dia.fecha}
                className={[
                  'home-dia',
                  dia.plan && 'home-dia-plan',
                  dia.hecho && 'home-dia-hecho',
                  dia.esHoy && 'home-dia-hoy',
                ].filter(Boolean).join(' ')}
              >
                <span>{dia.letra}</span>
                <span className="home-dia-marca" aria-hidden="true">
                  {dia.hecho ? '✓' : dia.plan ? '·' : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="home-vacio">{t('Elige tus días de entreno en Ajustes para encender la racha.', 'Pick your training days in Settings to light up your streak.')}</p>
        )}
      </section>

      {lineaMeta && (
        <button type="button" className="home-meta" onClick={() => irA('progreso')}>
          {lineaMeta}
        </button>
      )}

      <button type="button" className="btn btn-primario btn-grande home-entrenar" onClick={() => irA('entreno')}>
        <IconoEntreno tam={20} /> {estado.sesionActiva ? t('Continuar entreno', 'Continue workout') : t('Entrenar', 'Train')}
      </button>

      <h2 className="titulo-seccion">{t('Registro de hoy', "Today's log")}</h2>
      <div className="grid-2">
        <section className="panel home-reg">
          <div className="home-reg-titulo">👟 {t('Pasos', 'Steps')}</div>
          <div className={pasosHoy ? 'home-reg-hoy home-reg-ok' : 'home-reg-hoy'}>
            {pasosHoy ? t(`✓ ${pasosHoy.pasos.toLocaleString(localeNum())} hoy`, `✓ ${pasosHoy.pasos.toLocaleString(localeNum())} today`) : t('Sin registro hoy', 'No log today')}
          </div>
          <div
            className={'pasos-barra' + (pasosDeHoy >= metaPasos ? ' pasos-barra-llena' : '')}
            role="img"
            aria-label={t(
              `${pasosDeHoy.toLocaleString(localeNum())} de ${metaPasos.toLocaleString(localeNum())} pasos: ${tramosHoy} de 4 tramos`,
              `${pasosDeHoy.toLocaleString(localeNum())} of ${metaPasos.toLocaleString(localeNum())} steps: ${tramosHoy} of 4 segments`
            )}
          >
            <div className="pasos-barra-relleno" style={{ width: `${pctPasos}%` }} />
            <span className="pasos-marca" style={{ left: '25%' }} />
            <span className="pasos-marca" style={{ left: '50%' }} />
            <span className="pasos-marca" style={{ left: '75%' }} />
          </div>
          <div className="texto-suave pasos-meta-texto">
            {pasosDeHoy >= metaPasos
              ? t('✓ Meta del día', '✓ Daily goal')
              : `${pasosDeHoy.toLocaleString(localeNum())} / ${metaPasos.toLocaleString(localeNum())}`}
          </div>
          <input
            className="input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder={pasosHoy ? String(pasosHoy.pasos) : '6000'}
            value={textoPasos}
            onChange={(e) => setTextoPasos(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && textoPasos.trim()) guardarPasos() }}
            aria-label={t('Pasos de hoy', 'Steps today')}
          />
          <button type="button" className="btn home-reg-btn" onClick={guardarPasos} disabled={!textoPasos.trim()}>
            {pasosHoy ? t('Corregir', 'Correct') : t('Guardar', 'Save')}
          </button>
        </section>

        <section className="panel home-reg">
          <div className="home-reg-titulo">⚖️ {t('Peso', 'Weight')}</div>
          <div className={pesoHoy ? 'home-reg-hoy home-reg-ok' : 'home-reg-hoy'}>
            {pesoHoy ? t(`✓ ${pesoHoy.kg.toLocaleString(localeNum())} kg hoy`, `✓ ${pesoHoy.kg.toLocaleString(localeNum())} kg today`) : t('Sin registro hoy', 'No log today')}
          </div>
          <input
            className="input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder={pesoHoy ? pesoHoy.kg.toLocaleString(localeNum()) : t('82,5', '82.5')}
            value={textoPeso}
            onChange={(e) => setTextoPeso(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && textoPeso.trim()) guardarPeso() }}
            aria-label={t('Peso de hoy en kilogramos', "Today's weight in kilograms")}
          />
          <button type="button" className="btn home-reg-btn" onClick={guardarPeso} disabled={!textoPeso.trim()}>
            {pesoHoy ? t('Corregir', 'Correct') : t('Guardar', 'Save')}
          </button>
        </section>
      </div>
      <p className="texto-suave home-reg-nota">
        {t(
          'Los pasos suman según lo que andes: cada cuarto de tu meta cuenta, y completarla suma más. La báscula es solo tu gráfica: el número nunca cambia lo que ganas.',
          'Steps earn by how far you walk: every quarter of your goal counts, and completing it earns more. The scale is just your chart: the number never changes what you earn.'
        )}
      </p>

      {pautaSupl.length > 0 && (
        <>
          <h2 className="titulo-seccion">{t('Suplementos de hoy', "Today's supplements")}</h2>
          <section className="panel">
            <div className="supl-chips">
              {pautaSupl.map((id) => {
                const s = suplementoPorId(id)
                if (!s) return null
                const tomado = tomasHoy.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    className={tomado ? 'chip chip-activo' : 'chip'}
                    onClick={() => alternarSuplemento(id)}
                    aria-pressed={tomado}
                  >
                    {s.icono} {tomado ? '✓ ' : ''}{nombreSuplemento(s).split(' (')[0]}
                  </button>
                )
              })}
            </div>
            <div className="supl-adherencia texto-suave" aria-label={t('Últimos 7 días de suplementación', 'Last 7 days of supplements')}>
              {t('7 días:', '7 days:')}{' '}
              {adherencia.map((d, i) => (
                <span key={i} className={`supl-punto supl-punto-${d}`} aria-hidden="true">●</span>
              ))}
            </div>
          </section>
        </>
      )}

      <button type="button" className="btn btn-fantasma home-btn-ayer" onClick={() => setModalAyer(true)}>
        {t('🕰 ¿Te faltó ayer? Regístralo', '🕰 Missed yesterday? Log it')}
      </button>

      {esDomingoDePacto && (
        <button type="button" className="home-susurro" onClick={() => abrirGesta(true)}>
          <span className="home-susurro-icono" aria-hidden="true">🤝</span>
          <span className="home-susurro-cuerpo">
            <span className="home-susurro-linea">
              {t(`Domingo de pacto: comparte tu semana con ${pacto.nombre}.`, `Pact Sunday: share your week with ${pacto.nombre}.`)}
            </span>
          </span>
        </button>
      )}
      <button type="button" className="btn home-btn-gesta" onClick={() => abrirGesta(false)}>
        {t('🤝 Compartir mi semana', '🤝 Share my week')}
      </button>

      {modalGesta && (
        <Modal titulo={t('Tu gesta de la semana', 'Your feat of the week')} abierto onCerrar={() => setModalGesta(false)}>
          <div className="gesta-marco">
            <TarjetaGesta ref={refGesta} estado={estado} />
          </div>
          <p className="texto-suave gesta-nota">
            {t('Se comparte como imagen: exactamente lo que ves, nada más.', 'Shared as an image: exactly what you see, nothing more.')}
          </p>
          <button
            type="button"
            className="btn btn-primario btn-grande"
            onClick={() => compartirTarjeta(refGesta.current, avisar)}
          >
            {t('🤝 Compartir', '🤝 Share')}
          </button>
        </Modal>
      )}

      {modalAyer && (
        <Modal titulo={t(`Registrar ayer (${formatearFecha(ayer)})`, `Log yesterday (${formatearFecha(ayer)})`)} abierto onCerrar={() => setModalAyer(false)}>
          <div className="home-ayer">
            <div>
              <span className="etiqueta">👟 {t('Pasos de ayer', "Yesterday's steps")}</span>
              <div className={pasosAyer ? 'home-reg-hoy home-reg-ok' : 'home-reg-hoy'}>
                {pasosAyer ? t(`✓ ${pasosAyer.pasos.toLocaleString(localeNum())} registrados`, `✓ ${pasosAyer.pasos.toLocaleString(localeNum())} logged`) : t('Sin registro', 'No log')}
              </div>
              <div className="fila">
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="6000"
                  value={textoPasosAyer}
                  onChange={(e) => setTextoPasosAyer(e.target.value)}
                  aria-label={t('Pasos de ayer', "Yesterday's steps")}
                />
                <button type="button" className="btn" onClick={guardarPasosAyer} disabled={!textoPasosAyer.trim()}>
                  {pasosAyer ? t('Corregir', 'Correct') : t('Guardar', 'Save')}
                </button>
              </div>
            </div>
            <div>
              <span className="etiqueta">⚖️ {t('Peso de ayer', "Yesterday's weight")}</span>
              <div className={pesoAyer ? 'home-reg-hoy home-reg-ok' : 'home-reg-hoy'}>
                {pesoAyer ? `✓ ${pesoAyer.kg.toLocaleString(localeNum())} kg` : t('Sin registro', 'No log')}
              </div>
              <div className="fila">
                <input
                  className="input"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={t('82,5', '82.5')}
                  value={textoPesoAyer}
                  onChange={(e) => setTextoPesoAyer(e.target.value)}
                  aria-label={t('Peso de ayer en kilogramos', "Yesterday's weight in kilograms")}
                />
                <button type="button" className="btn" onClick={guardarPesoAyer} disabled={!textoPesoAyer.trim()}>
                  {pesoAyer ? t('Corregir', 'Correct') : t('Guardar', 'Save')}
                </button>
              </div>
            </div>
            <p className="texto-suave home-ayer-nota">
              {t('¿Entrenaste ayer? Regístralo desde ⚔️ Entreno activando «Es de ayer».', "Trained yesterday? Log it from ⚔️ Workout using 'It was yesterday'.")}
            </p>
            <button type="button" className="btn home-ayer-ir" onClick={() => { setModalAyer(false); irA('entreno') }}>
              {t('Ir a Entreno', 'Go to Workout')}
            </button>
          </div>
        </Modal>
      )}

      <h2 className="titulo-seccion">{t('Últimas gestas', 'Latest feats')}</h2>
      <section className="panel">
        {ultimosLogros.length === 0 ? (
          <p className="home-vacio">{t('Tus gestas aparecerán aquí. La primera está más cerca de lo que crees.', 'Your feats will appear here. The first one is closer than you think.')}</p>
        ) : (
          ultimosLogros.map(({ logro, fecha }) => (
            <div key={logro.id} className="home-logro">
              <span className="home-logro-icono" aria-hidden="true">{logro.icono}</span>
              <div className="home-logro-cuerpo">
                <div className="home-logro-nombre">{nombreLogro(logro)}</div>
                <div className="texto-suave home-logro-desc">{descLogro(logro)}</div>
              </div>
              <span className="home-logro-fecha">{formatearFecha(fecha)}</span>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
