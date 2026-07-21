import { useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import BarraXP from '../components/BarraXP.jsx'
import StatBarra from '../components/StatBarra.jsx'
import { claveDia, diaISO, sumarDias, formatearFecha } from '../engine/fechas.js'
import { nivelDesdeXp, statsActuales, calcularRacha } from '../engine/motor.js'
import { logroPorId } from '../data/logros.js'

const LETRAS_DIA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function Home({ estado, aplicarEvento, irA, avisar }) {
  const [textoPasos, setTextoPasos] = useState('')
  const [textoPeso, setTextoPeso] = useState('')

  const hoy = claveDia()
  const nv = nivelDesdeXp(estado.progreso.xp)
  const stats = statsActuales(estado)
  const racha = calcularRacha(estado, hoy)

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
          <Avatar etapaId={nv.etapa.id} tam={104} />
          <div className="home-carta-info">
            <h1 className="home-apodo">{estado.perfil.apodo}</h1>
            <div className="home-etapa">{nv.etapa.nombre} · Nivel {nv.nivel}</div>
            <BarraXP progreso={nv.progreso} etiqueta={etiquetaXp} />
          </div>
        </div>
      </section>

      <h2 className="titulo-seccion">Atributos</h2>
      <section className="panel">
        <StatBarra nombre="Fuerza" icono="⚔️" valor={stats.fuerza} />
        <StatBarra nombre="Resistencia" icono="🏃" valor={stats.resistencia} />
        <StatBarra nombre="Constancia" icono="🧭" valor={stats.constancia} />
      </section>

      <h2 className="titulo-seccion">Racha</h2>
      <section className="panel">
        <div className="home-racha-cab">
          <span className="home-racha-num">🔥 {racha}</span>
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
        ⚔️ {estado.sesionActiva ? 'Continuar entreno' : 'Entrenar'}
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
