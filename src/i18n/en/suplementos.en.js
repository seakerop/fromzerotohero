// Traducción al inglés del catálogo de suplementos: mismos ids, mismos campos de texto.

export const AVISO_SUPLEMENTOS_EN =
  'General information, not medical advice. If you have health conditions, ' +
  'take medication, or have doubts, talk to a healthcare professional. ' +
  'No jar replaces eating, sleeping, and training.'

export const SUPLEMENTOS_EN = {
  creatina: {
    nombre: 'Creatine (monohydrate)',
    icono: '⚡',
    evidencia: 'fuerte',
    que: 'The most science-backed supplement in sports: improves strength and power in short, intense efforts, and helps build muscle over time.',
    dosis: '3-5 g a day, EVERY day (rest days too). No loading phases.',
    cuando: 'Any time of day: what matters is daily consistency.',
    ojo: 'The scale may go up ~1 kg at first: that is water inside the muscle, not fat. Drink enough water.',
  },
  proteina: {
    nombre: 'Protein powder',
    icono: '🥛',
    evidencia: 'fuerte',
    que: 'Not magic: convenient food. What matters is your daily protein TOTAL (1.6-2.2 g per kg of body weight); the powder just helps you get there.',
    dosis: '20-40 g per shake, as many as you need to close out the day\'s total.',
    cuando: 'Whenever it fits you best. The 30-minute "anabolic window" is a myth: the whole day counts.',
    ojo: 'If you hit your protein through regular food, you do not need this at all.',
  },
  cafeina: {
    nombre: 'Caffeine',
    icono: '☕',
    evidencia: 'fuerte',
    que: 'Improves performance and perceived effort. The "pre-workout" that works is, basically, this.',
    dosis: '3-6 mg per kg of body weight (a machine coffee runs about 80-100 mg).',
    cuando: '30-60 minutes before your workout.',
    ojo: 'No caffeine 6-8 hours before bed: a coffee that steals your sleep takes more than it gives. Tolerance varies a lot.',
  },
  omega3: {
    nombre: 'Omega-3 (EPA/DHA)',
    icono: '🐟',
    evidencia: 'moderada',
    que: 'Worth considering for cardiovascular and general health if you eat little oily fish. Its direct effect on performance is modest.',
    dosis: '1-2 g a day of EPA+DHA combined (read the label, not the size of the capsule).',
    cuando: 'With a meal that contains fat: it absorbs better.',
    ojo: 'If you take blood thinners, check with your doctor first.',
  },
  'vitamina-d': {
    nombre: 'Vitamin D',
    icono: '☀️',
    evidencia: 'moderada',
    que: 'Key for bone, muscle, and immunity. With little sun (winter, indoor life) deficiency is very common; fixing it makes a real difference.',
    dosis: '1000-2000 IU a day. Ideally: get a blood test and adjust with good judgment.',
    cuando: 'With a meal that contains fat.',
    ojo: 'It is fat-soluble and builds up: no megadoses on your own.',
  },
  magnesio: {
    nombre: 'Magnesium',
    icono: '🌙',
    evidencia: 'moderada',
    que: 'Useful if your diet runs short (common): cramps, uneven rest. If your levels are normal, it adds no performance.',
    dosis: '200-400 mg at night, as citrate or bisglycinate.',
    cuando: 'Before bed tends to sit well.',
    ojo: 'The "oxide" form absorbs poorly and is a laxative: read the label.',
  },
  melatonina: {
    nombre: 'Melatonin',
    icono: '😴',
    evidencia: 'moderada',
    que: 'For RESETTING the clock (jet lag, shifts, earlier bedtimes), not an everyday sleeping pill. And sleep is your best supplement, by far.',
    dosis: '0.5-2 mg. Less is more: start with 0.5-1 mg.',
    cuando: '30-60 minutes before the time you WANT to fall asleep.',
    ojo: 'If you need it daily for weeks, the problem is your sleep habits: review them.',
  },
  electrolitos: {
    nombre: 'Electrolytes',
    icono: '🧂',
    evidencia: 'moderada',
    que: 'They make sense in long sessions (over 60-90 min) with heavy sweat or heavy heat. For a normal lifting session, water is enough.',
    dosis: 'Depends on the product; sodium is what truly matters when you sweat a lot.',
    cuando: 'During or after long, sweaty sessions.',
    ojo: 'Sugary sports drinks only pay off in long efforts: for everything else, they are soda.',
  },
}
