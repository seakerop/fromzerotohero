# FromZeroToHero

PWA para gamificar mi progreso en el gimnasio. Yo soy el personaje: empiezo
siendo Zero y el avatar evoluciona etapa a etapa hasta Hero, siguiendo el viaje
del héroe. Hecha con React y Vite, sin backend: todo se guarda en el propio
dispositivo (IndexedDB) y se puede instalar como app en el móvil.

La regla más importante del diseño: el XP sale siempre de acciones (entrenar,
mantener la racha, registrar datos, conseguir PRs), nunca del peso corporal.
La báscula es una gráfica más; el número no da puntos ni castiga.

## Qué hace

- Creación de personaje: un onboarding corto fija tu punto de partida y de ahí
  salen las stats iniciales (Fuerza, Resistencia, Constancia). El XP premia
  mejorar respecto a tu propio baseline, no números absolutos, y el baseline
  solo se recalibra hacia arriba cuando mejoras.
- Rutinas por días con biblioteca de ejercicios editable.
- Modo entreno pensado para usarlo con el móvil en el banco: botones grandes,
  en cada ejercicio ves lo que levantaste la última vez, y temporizador de
  descanso con aviso.
- PRs automáticos por peso máximo y 1RM estimado (fórmula de Epley). La
  primera vez que haces un ejercicio solo pone el listón: no hay PR regalado.
- Racha inteligente: solo cuenta los días que tú planificas; descansar no la
  rompe.
- 15 logros por comportamiento, incluido uno por volver después de una semana
  mala.
- Gráficas de progreso por ejercicio, volumen semanal y peso corporal con
  media móvil.
- Exportar e importar todos los datos en JSON.

## Correr en local

    npm install
    npm run dev

Los tests van con `npm test` y los iconos de la PWA se regeneran con
`npm run iconos`.

Queda preparado para una v2 que traiga los pasos y el pulso de Apple Salud
(en `docs/HEALTHKIT-V2.md` están las dos vías estudiadas).
