// Catálogo de suplementación: fichas sobrias con la evidencia como bandera.
// Mismo listón que el Códice de LifeCraft: consenso científico reconocido
// (posturas tipo ISSN/NIH), sin humo. La app NUNCA da XP por esto: registrar
// lo que tomas es información tuya, no un juego.

export const AVISO_SUPLEMENTOS =
  'Información general, no consejo médico. Si tienes condiciones de salud, ' +
  'tomas medicación o tienes dudas, consulta a un profesional sanitario. ' +
  'Ningún bote sustituye comer, dormir y entrenar.'

export const SUPLEMENTOS = [
  {
    id: 'creatina',
    nombre: 'Creatina (monohidrato)',
    icono: '⚡',
    evidencia: 'fuerte',
    que: 'El suplemento con más respaldo científico del deporte: mejora fuerza y potencia en esfuerzos cortos e intensos, y ayuda a ganar músculo con el tiempo.',
    dosis: '3-5 g al día, TODOS los días (también los de descanso). Sin fases de carga.',
    cuando: 'Da igual la hora: lo que importa es la constancia diaria.',
    ojo: 'Puede subir ~1 kg en la báscula al principio: es agua dentro del músculo, no grasa. Bebe suficiente agua.',
  },
  {
    id: 'proteina',
    nombre: 'Proteína en polvo',
    icono: '🥛',
    evidencia: 'fuerte',
    que: 'No es magia: es comida cómoda. Lo que importa es tu TOTAL diario de proteína (1,6-2,2 g por kg de peso); el polvo solo ayuda a llegar.',
    dosis: '20-40 g por batido, las veces que te haga falta para cerrar el total del día.',
    cuando: 'Donde mejor te encaje. La "ventana anabólica" de 30 minutos es un mito: cuenta el día completo.',
    ojo: 'Si llegas a tu proteína comiendo normal, no lo necesitas para nada.',
  },
  {
    id: 'cafeina',
    nombre: 'Cafeína',
    icono: '☕',
    evidencia: 'fuerte',
    que: 'Mejora el rendimiento y la percepción de esfuerzo. El "pre-entreno" que funciona es, básicamente, esto.',
    dosis: '3-6 mg por kg de peso (un café de máquina ronda los 80-100 mg).',
    cuando: '30-60 minutos antes de entrenar.',
    ojo: 'Nada de cafeína 6-8 horas antes de dormir: un café que te roba sueño te quita más de lo que te da. Tolerancia muy individual.',
  },
  {
    id: 'omega3',
    nombre: 'Omega-3 (EPA/DHA)',
    icono: '🐟',
    evidencia: 'moderada',
    que: 'Interesante para salud cardiovascular y general si comes poco pescado azul. Su efecto directo en el rendimiento es discreto.',
    dosis: '1-2 g al día de EPA+DHA combinados (mira la etiqueta, no el tamaño de la perla).',
    cuando: 'Con una comida que tenga grasa: se absorbe mejor.',
    ojo: 'Si tomas anticoagulantes, consúltalo antes.',
  },
  {
    id: 'vitamina-d',
    nombre: 'Vitamina D',
    icono: '☀️',
    evidencia: 'moderada',
    que: 'Clave para hueso, músculo e inmunidad. Con poco sol (invierno, vida de interior) el déficit es muy común; corregirlo sí que se nota.',
    dosis: '1000-2000 UI al día. Lo ideal: medirla en un análisis y ajustar con criterio.',
    cuando: 'Con una comida con grasa.',
    ojo: 'Es liposoluble y se acumula: nada de megadosis por tu cuenta.',
  },
  {
    id: 'magnesio',
    nombre: 'Magnesio',
    icono: '🌙',
    evidencia: 'moderada',
    que: 'Útil si tu dieta va corta (frecuente): calambres, descanso irregular. Si tus niveles son normales, no añade rendimiento.',
    dosis: '200-400 mg por la noche, en forma citrato o bisglicinato.',
    cuando: 'Antes de dormir suele sentar bien.',
    ojo: 'La forma "óxido" se absorbe mal y es laxante: mira la etiqueta.',
  },
  {
    id: 'melatonina',
    nombre: 'Melatonina',
    icono: '😴',
    evidencia: 'moderada',
    que: 'Para AJUSTAR el reloj (jet lag, turnos, acostarse antes), no un somnífero de diario. Y el sueño es tu mejor suplemento, con diferencia.',
    dosis: '0,5-2 mg. Menos es más: empieza por 0,5-1 mg.',
    cuando: '30-60 minutos antes de la hora a la que QUIERES dormirte.',
    ojo: 'Si la necesitas a diario durante semanas, el problema es de hábitos de sueño: revísalos.',
  },
  {
    id: 'electrolitos',
    nombre: 'Electrolitos',
    icono: '🧂',
    evidencia: 'moderada',
    que: 'Tienen sentido en sesiones largas (más de 60-90 min) con mucho sudor o mucho calor. Para una sesión normal de pesas, agua y ya.',
    dosis: 'Según producto; el sodio es el que de verdad importa al sudar mucho.',
    cuando: 'Durante o después de sesiones largas y sudorosas.',
    ojo: 'Las bebidas deportivas con azúcar solo compensan en esfuerzos largos: para el resto, son un refresco.',
  },
]

export function suplementoPorId(id) {
  return SUPLEMENTOS.find((s) => s.id === id) || null
}
