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
  siguienteEtapaArbol,
} from '../engine/motor.js'
import { logroPorId } from '../data/logros.js'
import { suplementoPorId } from '../data/suplementos.js'

const LETRAS_DIA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const NOMBRE_ESTACION = {
  primavera: 'primavera',
  verano: 'verano',
  otono: 'otoño',
  invierno: 'invierno',
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
    ? `Nv ${nv.nivel} · Nivel máximo`
    : `Nv ${nv.nivel} · ${nv.xpEnNivel}/${nv.xpParaSubir} XP`

  const lunes = sumarDias(hoy, 1 - diaISO(hoy))
  const fechasConSesion = new Set(estado.sesiones.map((s) => s.fecha))
  const planificados = new Set(estado.ajustes.diasPlanificados)
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
  const pesoHoy = estado.cuerpo.pesos.find((p) => p.fecha === hoy) || null

  const ayer = sumarDias(hoy, -1)
  const pasosAyer = estado.pasos.find((p) => p.fecha === ayer) || null
  const pesoAyer = estado.cuerpo.pesos.find((p) => p.fecha === ayer) || null

  // Suplementación: seguimiento informativo puro, SIN XP (como la báscula).
  const pautaSupl = (estado.suplementos && estado.suplementos.pauta) || []
  const tomas = (estado.suplementos && estado.suplementos.tomas) || {}
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
      avisar('Introduce un número de pasos válido', 'error')
      return
    }
    const resultados = aplicarEvento({ tipo: 'pasos', fecha: hoy, pasos: n, fuente: 'manual' })
    if (!resultados.some((r) => r.tipo === 'xp')) avisar('Pasos de hoy actualizados', 'info')
    setTextoPasos('')
  }

  function guardarPeso() {
    const n = parseFloat(textoPeso.replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0 || n > 400) {
      avisar('Introduce un peso válido en kg', 'error')
      return
    }
    const kg = Math.round(n * 10) / 10
    const resultados = aplicarEvento({ tipo: 'peso', fecha: hoy, kg })
    if (!resultados.some((r) => r.tipo === 'xp')) avisar('Peso de hoy actualizado', 'info')
    setTextoPeso('')
  }

  // Registrar el AYER que se te olvidó: mismo motor, misma dedup de XP, solo
  // cambia la fecha. Únicamente ayer — el pasado lejano no se reconstruye.
  function guardarPasosAyer() {
    const n = parseInt(textoPasosAyer.replace(/[.\s]/g, ''), 10)
    if (!Number.isFinite(n) || n < 0 || n > 200000) {
      avisar('Introduce un número de pasos válido', 'error')
      return
    }
    const resultados = aplicarEvento({ tipo: 'pasos', fecha: ayer, pasos: n, fuente: 'manual' })
    if (!resultados.some((r) => r.tipo === 'xp')) avisar('Pasos de ayer actualizados', 'info')
    setTextoPasosAyer('')
  }

  function guardarPesoAyer() {
    const n = parseFloat(textoPesoAyer.replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0 || n > 400) {
      avisar('Introduce un peso válido en kg', 'error')
      return
    }
    const kg = Math.round(n * 10) / 10
    const resultados = aplicarEvento({ tipo: 'peso', fecha: ayer, kg })
    if (!resultados.some((r) => r.tipo === 'xp')) avisar('Peso de ayer actualizado', 'info')
    setTextoPesoAyer('')
  }

  return (
    <div className="vista">
      {estado.sesionActiva && (
        <div className="home-sesion">
          <span className="home-sesion-punto" aria-hidden="true" />
          <div className="home-sesion-texto">
            <strong>Sesión en curso</strong>
            <div className="texto-suave">{estado.sesionActiva.nombreDia}</div>
          </div>
          <button type="button" className="btn" onClick={() => irA('entreno')}>
            Continuar
          </button>
        </div>
      )}

      <section className="panel">
        <div className="home-carta">
          <button
            type="button"
            className="home-avatar-boton"
            onClick={() => setFichaAbierta(true)}
            aria-label="Ver la ficha de tu árbol"
          >
            <Avatar dias={diasCamino} tam={104} />
          </button>
          <div className="home-carta-info">
            <h1 className="home-apodo">{estado.perfil.apodo}</h1>
            <div className="home-etapa">{nv.etapa.nombre} · Nivel {nv.nivel}</div>
            <BarraXP progreso={nv.progreso} etiqueta={etiquetaXp} />
            <div className="home-arbol-linea texto-suave" title={etapaDelArbol.descripcion}>
              🌱 {etapaDelArbol.nombre} · día {diasCamino} del camino
              {siguienteArbol ? ` · crece el día ${siguienteArbol.dias}` : ''}
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
        <Modal titulo="Tu árbol" abierto onCerrar={() => setFichaAbierta(false)}>
          <div className="ficha-arbol">
            <Avatar dias={diasCamino} tam={160} />
            <div>
              <div className="ficha-etapa">{etapaDelArbol.nombre}</div>
              <p className="ficha-lema">«{etapaDelArbol.descripcion}»</p>
            </div>
            <div className="ficha-datos">
              Día {diasCamino} del camino
              {proximoMomento(diasCamino) &&
                ` · próximo brote: día ${proximoMomento(diasCamino).dia}`}
              <br />
              Ahora es {NOMBRE_ESTACION[estacionDeMes(new Date().getMonth() + 1)]}: la
              estación real viste tu árbol.
            </div>
            <p className="ficha-como">
              Crece con tus días de acción: días en los que entrenas, caminas o
              registras. Máximo un día por día real, sin atajos. Y nunca
              retrocede: si faltas, te espera.
            </p>
            <h3 className="titulo-seccion ficha-titulo">Crónica</h3>
            <div className="ficha-cronica">
              {MOMENTOS_ARBOL.map((m) => {
                const hecho = m.dia <= diasCamino
                return (
                  <div key={m.dia} className={hecho ? 'ficha-momento hecho' : 'ficha-momento'}>
                    <span>
                      <span className="ficha-check" aria-hidden="true">{hecho ? '✓ ' : '· '}</span>
                      {m.etiqueta}
                    </span>
                    <span className="ficha-dia">día {m.dia}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Modal>
      )}

      <h2 className="titulo-seccion">Atributos</h2>
      <section className="panel">
        <StatBarra nombre="Fuerza" icono="⚔️" valor={stats.fuerza} />
        <StatBarra nombre="Resistencia" icono="🏃" valor={stats.resistencia} />
        <StatBarra nombre="Constancia" icono="🧭" valor={stats.constancia} />
      </section>

      <h2 className="titulo-seccion">Racha</h2>
      <section className="panel">
        <div className="home-racha-cab">
          <span className="home-racha-num"><IconoRacha tam={20} /> {racha}</span>
          <span>{racha === 1 ? 'día de racha' : 'días de racha'}</span>
          {estado.progreso.rachaMejor > 0 && (
            <span className="texto-suave home-racha-mejor">Mejor: {estado.progreso.rachaMejor}</span>
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
          <p className="home-vacio">Elige tus días de entreno en Ajustes para encender la racha.</p>
        )}
      </section>

      <button type="button" className="btn btn-primario btn-grande home-entrenar" onClick={() => irA('entreno')}>
        <IconoEntreno tam={20} /> {estado.sesionActiva ? 'Continuar entreno' : 'Entrenar'}
      </button>

      <h2 className="titulo-seccion">Registro de hoy</h2>
      <div className="grid-2">
        <section className="panel home-reg">
          <div className="home-reg-titulo">👟 Pasos</div>
          <div className={pasosHoy ? 'home-reg-hoy home-reg-ok' : 'home-reg-hoy'}>
            {pasosHoy ? `✓ ${pasosHoy.pasos.toLocaleString('es-ES')} hoy` : 'Sin registro hoy'}
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
            aria-label="Pasos de hoy"
          />
          <button type="button" className="btn home-reg-btn" onClick={guardarPasos} disabled={!textoPasos.trim()}>
            {pasosHoy ? 'Corregir' : 'Guardar'}
          </button>
        </section>

        <section className="panel home-reg">
          <div className="home-reg-titulo">⚖️ Peso</div>
          <div className={pesoHoy ? 'home-reg-hoy home-reg-ok' : 'home-reg-hoy'}>
            {pesoHoy ? `✓ ${pesoHoy.kg.toLocaleString('es-ES')} kg hoy` : 'Sin registro hoy'}
          </div>
          <input
            className="input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder={pesoHoy ? pesoHoy.kg.toLocaleString('es-ES') : '82,5'}
            value={textoPeso}
            onChange={(e) => setTextoPeso(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && textoPeso.trim()) guardarPeso() }}
            aria-label="Peso de hoy en kilogramos"
          />
          <button type="button" className="btn home-reg-btn" onClick={guardarPeso} disabled={!textoPeso.trim()}>
            {pesoHoy ? 'Corregir' : 'Guardar'}
          </button>
        </section>
      </div>
      <p className="texto-suave home-reg-nota">
        Registrar suma XP una vez al día. La báscula es solo tu gráfica: el número nunca cambia lo que ganas.
      </p>

      {pautaSupl.length > 0 && (
        <>
          <h2 className="titulo-seccion">Suplementos de hoy</h2>
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
                    {s.icono} {tomado ? '✓ ' : ''}{s.nombre.split(' (')[0]}
                  </button>
                )
              })}
            </div>
            <div className="supl-adherencia texto-suave" aria-label="Últimos 7 días de suplementación">
              7 días:{' '}
              {adherencia.map((d, i) => (
                <span key={i} className={`supl-punto supl-punto-${d}`} aria-hidden="true">●</span>
              ))}
            </div>
          </section>
        </>
      )}

      <button type="button" className="btn btn-fantasma home-btn-ayer" onClick={() => setModalAyer(true)}>
        🕰 ¿Te faltó ayer? Regístralo
      </button>

      {esDomingoDePacto && (
        <button type="button" className="home-susurro" onClick={() => abrirGesta(true)}>
          <span className="home-susurro-icono" aria-hidden="true">🤝</span>
          <span className="home-susurro-cuerpo">
            <span className="home-susurro-linea">Domingo de pacto: comparte tu semana con {pacto.nombre}.</span>
          </span>
        </button>
      )}
      <button type="button" className="btn home-btn-gesta" onClick={() => abrirGesta(false)}>
        🤝 Compartir mi semana
      </button>

      {modalGesta && (
        <Modal titulo="Tu gesta de la semana" abierto onCerrar={() => setModalGesta(false)}>
          <div className="gesta-marco">
            <TarjetaGesta ref={refGesta} estado={estado} />
          </div>
          <p className="texto-suave gesta-nota">
            Se comparte como imagen: exactamente lo que ves, nada más.
          </p>
          <button
            type="button"
            className="btn btn-primario btn-grande"
            onClick={() => compartirTarjeta(refGesta.current, avisar)}
          >
            🤝 Compartir
          </button>
        </Modal>
      )}

      {modalAyer && (
        <Modal titulo={`Registrar ayer (${formatearFecha(ayer)})`} abierto onCerrar={() => setModalAyer(false)}>
          <div className="home-ayer">
            <div>
              <span className="etiqueta">👟 Pasos de ayer</span>
              <div className={pasosAyer ? 'home-reg-hoy home-reg-ok' : 'home-reg-hoy'}>
                {pasosAyer ? `✓ ${pasosAyer.pasos.toLocaleString('es-ES')} registrados` : 'Sin registro'}
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
                  aria-label="Pasos de ayer"
                />
                <button type="button" className="btn" onClick={guardarPasosAyer} disabled={!textoPasosAyer.trim()}>
                  {pasosAyer ? 'Corregir' : 'Guardar'}
                </button>
              </div>
            </div>
            <div>
              <span className="etiqueta">⚖️ Peso de ayer</span>
              <div className={pesoAyer ? 'home-reg-hoy home-reg-ok' : 'home-reg-hoy'}>
                {pesoAyer ? `✓ ${pesoAyer.kg.toLocaleString('es-ES')} kg` : 'Sin registro'}
              </div>
              <div className="fila">
                <input
                  className="input"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="82,5"
                  value={textoPesoAyer}
                  onChange={(e) => setTextoPesoAyer(e.target.value)}
                  aria-label="Peso de ayer en kilogramos"
                />
                <button type="button" className="btn" onClick={guardarPesoAyer} disabled={!textoPesoAyer.trim()}>
                  {pesoAyer ? 'Corregir' : 'Guardar'}
                </button>
              </div>
            </div>
            <p className="texto-suave home-ayer-nota">
              ¿Entrenaste ayer? Regístralo desde ⚔️ Entreno activando «Es de ayer».
            </p>
            <button type="button" className="btn home-ayer-ir" onClick={() => { setModalAyer(false); irA('entreno') }}>
              Ir a Entreno
            </button>
          </div>
        </Modal>
      )}

      <h2 className="titulo-seccion">Últimas gestas</h2>
      <section className="panel">
        {ultimosLogros.length === 0 ? (
          <p className="home-vacio">Tus gestas aparecerán aquí. La primera está más cerca de lo que crees.</p>
        ) : (
          ultimosLogros.map(({ logro, fecha }) => (
            <div key={logro.id} className="home-logro">
              <span className="home-logro-icono" aria-hidden="true">{logro.icono}</span>
              <div className="home-logro-cuerpo">
                <div className="home-logro-nombre">{logro.nombre}</div>
                <div className="texto-suave home-logro-desc">{logro.descripcion}</div>
              </div>
              <span className="home-logro-fecha">{formatearFecha(fecha)}</span>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
