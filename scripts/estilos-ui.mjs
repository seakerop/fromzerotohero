// Genera dist/estilos-ui.html: TRES direcciones visuales completas aplicadas
// al Home real de FromZeroToHero, para ELEGIR tema antes de tocar la app.
// Todas llevan ya iconos SVG propios (adiós emojis) — eso va incluido gane
// quien gane. Uso: node scripts/estilos-ui.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')

// Iconos de línea (24×24, stroke) definidos una vez y coloreados por tema.
const ICONOS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-inicio" viewBox="0 0 24 24"><path d="M4 20V10.5L7 8V5h2v2l3-2.5L21 10.5V20h-5v-5h-4v5H4Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
  <symbol id="i-entreno" viewBox="0 0 24 24"><path d="M4 4l9 9M20 4l-9 9M4 4v3M4 4h3M20 4v3M20 4h-3M6.5 17.5l-2 2M8 19l-3-3M17.5 17.5l2 2M16 19l3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
  <symbol id="i-rutinas" viewBox="0 0 24 24"><path d="M7 3h10a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z M9 8h6M9 12h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></symbol>
  <symbol id="i-progreso" viewBox="0 0 24 24"><path d="M4 20h16M5 16l4-5 3 3 6-8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="6" r="1.4" fill="currentColor"/></symbol>
  <symbol id="i-ajustes" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
  <symbol id="i-racha" viewBox="0 0 24 24"><path d="M12 3c1 3-1.5 4.5-1.5 7a4 4 0 0 0 3 3.9c2-.6 3-2.4 2.6-4.4C18.5 11 20 13 20 15.5A7 7 0 0 1 6 16c0-4 3-5.5 4-8.5.4-1.2.5-2.8 2-4.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
</svg>`

const ARBOL = `
<svg viewBox="0 0 120 120" class="mini-arbol" aria-hidden="true">
  <circle cx="60" cy="60" r="56" class="arb-marco"/>
  <path d="M 0 83 Q 60 74 120 83 L 120 120 L 0 120 Z" fill="#1c1712"/>
  <path d="M 57.8 81 C 57 72 58.5 66 59.2 58 L 60.8 58 C 61.5 66 63 72 62.2 81 Z" fill="#6d5334"/>
  <circle cx="60" cy="52" r="11" fill="#457a39"/>
  <circle cx="51" cy="58" r="8" fill="#31572b"/>
  <circle cx="69" cy="57" r="8" fill="#5f9c4b"/>
  <circle cx="55" cy="48" r="6" fill="#5f9c4b"/>
  <circle cx="64" cy="46" r="4" fill="#7fbd66"/>
</svg>`

function telefono(tema, titulo, sello) {
  return `
  <div class="columna">
    <h2 class="dir dir-${tema}">${titulo}</h2>
    <p class="sello">${sello}</p>
    <div class="tel tema-${tema}">
      <div class="marca">FromZeroToHero</div>
      <div class="panel carta">
        ${ARBOL}
        <div class="carta-info">
          <div class="apodo">Emilio</div>
          <div class="etapa">La Llamada · Nivel 3</div>
          <div class="xp"><div class="xp-relleno" style="width:73%"></div></div>
          <div class="xp-txt">Nv 3 · 95/130 XP</div>
        </div>
      </div>
      <div class="sec">Atributos</div>
      <div class="panel">
        <div class="stat"><span>Fuerza</span><i style="width:14%"></i><b>14</b></div>
        <div class="stat"><span>Resistencia</span><i style="width:10%"></i><b>10</b></div>
        <div class="stat"><span>Constancia</span><i style="width:10%"></i><b>10</b></div>
      </div>
      <div class="sec">Racha</div>
      <div class="panel">
        <div class="racha-cab"><svg class="ico ico-racha"><use href="#i-racha"/></svg><b>3</b><span>días de racha</span></div>
        <div class="dias">
          <span class="dia hecho">L</span><span class="dia">M</span><span class="dia hecho">X</span>
          <span class="dia">J</span><span class="dia plan hoy">V</span><span class="dia off">S</span><span class="dia off">D</span>
        </div>
      </div>
      <button class="btn-primario"><svg class="ico"><use href="#i-entreno"/></svg> Entrenar</button>
      <div class="tabbar">
        <span class="tab activa"><svg class="ico"><use href="#i-inicio"/></svg><small>Inicio</small></span>
        <span class="tab"><svg class="ico"><use href="#i-entreno"/></svg><small>Entreno</small></span>
        <span class="tab"><svg class="ico"><use href="#i-rutinas"/></svg><small>Rutinas</small></span>
        <span class="tab"><svg class="ico"><use href="#i-progreso"/></svg><small>Progreso</small></span>
        <span class="tab"><svg class="ico"><use href="#i-ajustes"/></svg><small>Ajustes</small></span>
      </div>
    </div>
  </div>`
}

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FromZeroToHero — elige el tema visual</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  body { background: #08090d; color: #e8e6df; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; padding: 24px 14px 40px; }
  header { text-align: center; max-width: 640px; margin: 0 auto 20px; }
  header h1 { color: #d9a441; font-size: 21px; }
  header p { color: #98a0b8; font-size: 14px; margin-top: 6px; }
  .parrilla { display: flex; flex-wrap: wrap; gap: 26px; justify-content: center; align-items: flex-start; }
  .columna { width: 375px; max-width: 100%; }
  .dir { font-size: 16px; margin-bottom: 2px; }
  .dir-piedra { color: #d9a441; } .dir-sobrio { color: #9db4d8; } .dir-cronica { color: #d8b06a; }
  .sello { color: #98a0b8; font-size: 12.5px; margin-bottom: 10px; min-height: 34px; }
  .tel { border-radius: 26px; padding: 18px 14px 0; overflow: hidden; border: 1px solid #262c3c; }
  .marca { text-align: center; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; opacity: .8; }
  .mini-arbol { width: 84px; height: 84px; flex-shrink: 0; }
  .arb-marco { fill: #141826; stroke: #2a3045; stroke-width: 2; }
  .carta { display: flex; gap: 12px; align-items: center; }
  .apodo { font-size: 24px; font-weight: 800; }
  .etapa { font-size: 13px; margin: 2px 0 8px; }
  .xp { height: 8px; border-radius: 4px; overflow: hidden; background: rgba(255,255,255,.07); }
  .xp-relleno { height: 100%; }
  .xp-txt { font-size: 11.5px; margin-top: 4px; opacity: .75; }
  .sec { margin: 16px 2px 8px; font-size: 12px; }
  .panel { padding: 14px; }
  .stat { display: flex; align-items: center; gap: 10px; font-size: 14px; padding: 5px 0; }
  .stat span { width: 96px; }
  .stat i { flex: 1; height: 6px; border-radius: 3px; display: block; }
  .stat b { width: 26px; text-align: right; }
  .racha-cab { display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 10px; }
  .racha-cab b { font-size: 20px; }
  .dias { display: flex; gap: 6px; }
  .dia { flex: 1; text-align: center; padding: 8px 0; border-radius: 10px; font-size: 12px; font-weight: 700; }
  .ico { width: 21px; height: 21px; }
  .btn-primario { width: 100%; margin-top: 16px; min-height: 52px; border: none; border-radius: 14px;
    font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: default; }
  .tabbar { display: flex; margin: 18px -14px 0; padding: 8px 6px 12px; }
  .tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 10px; }

  /* ————— A · PIEDRA Y ORO ————— */
  .tema-piedra { background: linear-gradient(170deg, #10131d 0%, #0b0d15 60%); font-family: -apple-system, 'Segoe UI', sans-serif; color: #e8e4d8; }
  .tema-piedra .marca { color: #d9a441; font-family: Georgia, serif; }
  .tema-piedra .panel { background: linear-gradient(180deg, #1a1e2c, #141726); border: 1px solid #37314b;
    border-radius: 6px; position: relative; box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 6px 16px rgba(0,0,0,.4); }
  .tema-piedra .panel::before, .tema-piedra .panel::after { content: ''; position: absolute; width: 9px; height: 9px; border: 2px solid #d9a441; opacity: .6; }
  .tema-piedra .panel::before { top: -2px; left: -2px; border-right: none; border-bottom: none; }
  .tema-piedra .panel::after { bottom: -2px; right: -2px; border-left: none; border-top: none; }
  .tema-piedra .sec { color: #d9a441; font-family: Georgia, serif; font-variant: small-caps; letter-spacing: 2.5px; font-size: 14px; }
  .tema-piedra .apodo { font-family: Georgia, serif; letter-spacing: .5px; }
  .tema-piedra .etapa { color: #d9a441; font-variant: small-caps; letter-spacing: 1.5px; }
  .tema-piedra .xp-relleno { background: linear-gradient(90deg, #a97a2c, #f0c86e); }
  .tema-piedra .stat i { background: linear-gradient(90deg, #a97a2c, #d9a441); }
  .tema-piedra .stat span { color: #b9b3a4; }
  .tema-piedra .ico { color: #d9a441; }
  .tema-piedra .dia { border: 1px solid #2c3145; color: #6d7389; background: #12151f; }
  .tema-piedra .dia.hecho { border-color: #d9a441; color: #f0c86e; background: rgba(217,164,65,.12); }
  .tema-piedra .dia.plan { border-color: #4b5270; } .tema-piedra .dia.hoy { outline: 1px solid #60a5fa; }
  .tema-piedra .dia.off { opacity: .4; }
  .tema-piedra .btn-primario { background: linear-gradient(180deg, #e3b455, #b8842c); color: #191204;
    border: 1px solid #f0c86e; box-shadow: 0 4px 14px rgba(217,164,65,.25), inset 0 1px 0 rgba(255,255,255,.35); border-radius: 8px; }
  .tema-piedra .btn-primario .ico { color: #191204; }
  .tema-piedra .tabbar { background: #0d0f18; border-top: 1px solid #37314b; }
  .tema-piedra .tab { color: #5d6377; } .tema-piedra .tab.activa { color: #f0c86e; }

  /* ————— B · SOBRIO PREMIUM ————— */
  .tema-sobrio { background: #0a0c10; color: #e7e9ee; }
  .tema-sobrio .marca { color: #6f7789; letter-spacing: 4px; }
  .tema-sobrio .panel { background: #12151c; border: none; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,.45); }
  .tema-sobrio .sec { color: #7b8296; text-transform: uppercase; letter-spacing: 2.2px; font-size: 10.5px; font-weight: 600; }
  .tema-sobrio .apodo { letter-spacing: -.4px; font-weight: 700; }
  .tema-sobrio .etapa { color: #d9a441; font-size: 12.5px; font-weight: 600; }
  .tema-sobrio .xp { background: #1c202b; } .tema-sobrio .xp-relleno { background: #d9a441; }
  .tema-sobrio .stat span { color: #8b93a7; font-size: 13.5px; }
  .tema-sobrio .stat i { background: #2a3040; position: relative; }
  .tema-sobrio .stat i::after { content:''; position:absolute; inset:0; width:inherit; }
  .tema-sobrio .stat b { color: #fff; }
  .tema-sobrio .ico { color: #aeb6c8; }
  .tema-sobrio .racha-cab b { color: #d9a441; }
  .tema-sobrio .dia { background: #171b24; color: #596174; }
  .tema-sobrio .dia.hecho { background: #d9a441; color: #14161c; }
  .tema-sobrio .dia.hoy { box-shadow: 0 0 0 1.5px #d9a441 inset; color: #d9a441; }
  .tema-sobrio .dia.off { opacity: .35; }
  .tema-sobrio .btn-primario { background: #d9a441; color: #14161c; border-radius: 999px; }
  .tema-sobrio .btn-primario .ico { color: #14161c; }
  .tema-sobrio .tabbar { background: rgba(18,21,28,.9); border-top: 1px solid #1d212c; }
  .tema-sobrio .tab { color: #596174; } .tema-sobrio .tab.activa { color: #d9a441; }

  /* ————— C · CRÓNICA ————— */
  .tema-cronica { background: #14100a; color: #eadfc8; font-family: Georgia, 'Times New Roman', serif; }
  .tema-cronica .marca { color: #b18b45; font-style: italic; letter-spacing: 2px; text-transform: none; font-size: 13px; }
  .tema-cronica .panel { background: #1b160e; border: 1px solid #3c2f1a; border-radius: 10px; box-shadow: 0 4px 14px rgba(0,0,0,.35); }
  .tema-cronica .sec { color: #b18b45; font-style: italic; font-size: 15px; border-bottom: 1px solid #3c2f1a; padding-bottom: 4px; }
  .tema-cronica .apodo { font-size: 27px; font-weight: 400; }
  .tema-cronica .etapa { color: #d8b06a; font-style: italic; }
  .tema-cronica .xp { background: #2a2213; } .tema-cronica .xp-relleno { background: #d8b06a; }
  .tema-cronica .xp-txt, .tema-cronica .stat b, .tema-cronica .racha-cab b { font-variant-numeric: oldstyle-nums; }
  .tema-cronica .stat span { color: #b8a888; }
  .tema-cronica .stat i { background: #d8b06a; opacity: .8; }
  .tema-cronica .ico { color: #d8b06a; }
  .tema-cronica .dia { border: 1px solid #3c2f1a; border-radius: 50%; color: #877651; aspect-ratio: 1; padding: 0; display: flex; align-items: center; justify-content: center; }
  .tema-cronica .dia.hecho { background: #d8b06a; color: #1b160e; border-color: #d8b06a; }
  .tema-cronica .dia.hoy { outline: 1px dashed #d8b06a; outline-offset: 2px; }
  .tema-cronica .dia.off { opacity: .35; }
  .tema-cronica .btn-primario { background: transparent; border: 1.5px solid #d8b06a; color: #d8b06a; border-radius: 10px; font-family: Georgia, serif; }
  .tema-cronica .btn-primario .ico { color: #d8b06a; }
  .tema-cronica .tabbar { background: #120e08; border-top: 1px solid #3c2f1a; }
  .tema-cronica .tab { color: #6d5f42; } .tema-cronica .tab.activa { color: #d8b06a; }
</style>
</head>
<body>
${ICONOS}
<header>
  <h1>Elige el tema visual de FromZeroToHero</h1>
  <p>El mismo Home con tres pieles completas. Las tres llevan ya iconos propios
  en vez de emojis (eso entra gane quien gane). También puedes mezclar:
  «la B con los títulos de la C», por ejemplo.</p>
</header>
<div class="parrilla">
  ${telefono('piedra', 'A · Piedra y oro', 'RPG artesanal: losas biseladas, esquinas doradas, versalitas. La más fantasía.')}
  ${telefono('sobrio', 'B · Sobrio premium', 'Minimal oscuro elegante: sin bordes, sombras suaves, oro con cuentagotas. La más "app seria".')}
  ${telefono('cronica', 'C · Crónica', 'Manuscrito: serif con carácter, tinta dorada, aire de diario de campaña. La más literaria.')}
</div>
</body>
</html>
`

mkdirSync(join(RAIZ, 'dist'), { recursive: true })
writeFileSync(join(RAIZ, 'dist', 'estilos-ui.html'), html, 'utf8')
console.log('comparativa de temas generada en dist/estilos-ui.html')
