# Pasos de Apple Salud (app de iPhone)

La app instalada como app de iPhone lee de Salud tus pasos de **hoy y de
ayer** (los del iPhone y los del Apple Watch, que ya van a Salud) y los
registra sola al abrirla y al volver a ella. Solo lee pasos, nada más, y
todo se queda en el móvil: no hay servidor.

Si un día apuntas los pasos a mano y tu número es mayor, se respeta el tuyo.

## En el Mac, la primera vez

1. Instala **Xcode** desde la App Store y ábrelo una vez (acepta la licencia).
2. Instala **Node.js** LTS desde nodejs.org.
3. En el Terminal:

   ```bash
   git clone https://github.com/seakerop/fromzerotohero.git
   cd fromzerotohero
   npm install
   npm run build
   npx cap add ios
   npx cap sync ios
   npx cap open ios
   ```

4. Ya en Xcode, con el proyecto **App** seleccionado:
   - **Signing & Capabilities** → elige tu *Team* (tu Apple ID).
   - Si se queja del identificador, cambia el *Bundle Identifier* a algo
     tuyo: `com.tunombre.fromzerotohero`.
   - Pulsa **+ Capability** y añade **HealthKit**.
   - Abre `Info.plist` y añade estas dos claves:

     ```xml
     <key>NSHealthShareUsageDescription</key>
     <string>FromZeroToHero lee tus pasos para registrarlos sin que los escribas a mano.</string>
     <key>NSHealthUpdateUsageDescription</key>
     <string>FromZeroToHero no escribe nada en Salud.</string>
     ```

5. Conecta el iPhone por cable, elígelo como destino arriba y pulsa ▶.
6. En el iPhone: **Ajustes → General → VPN y gestión de dispositivos** y
   confía en tu certificado de desarrollador.
7. Abre la app → **Ajustes → Salud → Conectar con Salud** y permite *Pasos*.

## Cada vez que cambiemos algo

```bash
git pull && npm install && npm run build && npx cap sync ios
```

y vuelve a pulsar ▶ en Xcode.

## Letra pequeña

- Con un **Apple ID gratuito** la app caduca a los **7 días** y hay que
  volver a instalarla. Con la cuenta de desarrollador (99 €/año) se queda, y
  puedes instalársela a otra persona o subirla a la App Store.
- Los datos de la app de iPhone son **independientes** de los de la versión
  web: pásalos con *Exportar copia* en la web e *Importar copia* en la app.
- iOS nunca confirma si diste permiso de **lectura** (lo oculta a propósito).
  Si no entran pasos, míralo en **Salud → Compartir → Apps → FromZeroToHero**.
