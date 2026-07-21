# Apple Salud en v2

En v1 los pasos se apuntan a mano. Cuando queramos que entren solos desde el
iPhone (pasos, pulso, calorías), hay dos caminos.

## Vía A: Capacitor + plugin de HealthKit

Envolver la PWA con Capacitor y añadir un plugin de HealthKit. La app pasa a
ser una app iOS nativa y puede leer Salud directamente, incluso en segundo
plano.

A cambio: hace falta un Mac con Xcode para compilar, firmar con cuenta de
Apple Developer e instalar por Xcode o TestFlight. Es la vía buena si algún
día esto va a la App Store, pero es la que más tooling arrastra.

## Vía B: Atajos de iOS o Health Auto Export

Sin tocar código nativo. Un atajo de iOS (o la app Health Auto Export) lee
Salud cada noche y manda un JSON con los datos del día a un endpoint
serverless mínimo (una función en Vercel o Cloudflare con un token). La PWA,
al abrirse, consulta ese endpoint y registra los pasos con fuente 'salud'.

A cambio: rompe un poco el "sin backend" (aunque el endpoint solo hace de
buzón) y depende de que el atajo se ejecute. Es la vía rápida para uso propio.

## Qué deja preparado v1

- Cada registro de pasos lleva el campo `fuente` ('manual' hoy, 'salud'
  mañana), y el motor acepta pasos de cualquier fuente por el mismo evento
  `pasos`.
- `migrar()` en `src/db/db.js` rellena campos ausentes con defaults, así que
  añadir pulso o calorías al estado no rompe los datos ya guardados.
- El XP por pasos tiene tope diario, así que importar datos automáticos no
  infla la progresión.
