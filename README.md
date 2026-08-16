# Mensajes Vivos

PWA móvil para descubrir patrimonio arqueológico de México con la cámara. Slogan: *Mira. Reconoce. Escucha el México antiguo.*

Las imágenes se analizan **en el dispositivo**. En **Guías** se descarga el modelo CLIP (~92 MB) una vez; las fotos no se envían.

## Requisitos

- Node 22+
- Navegador con cámara (HTTPS o `localhost`)

## Scripts

```bash
npm install
npm run generate:audio
npm run dev
npm test
npm run build
npm run preview
```

La app usa `HashRouter` y `base` `/mensajes-vivos/` para GitHub Pages.

## Instalar como PWA

1. Abre el sitio por HTTPS.
2. En el menú del navegador, elige *Añadir a la pantalla de inicio* / *Instalar*.
3. Tras descargar un paquete, prueba modo avión: el shell y los archivos del paquete siguen disponibles.

## Flujos

1. Splash → privacidad → cámara (luego GPS, con explicación).
2. Geocerca del Museo Nacional de Antropología → descarga del paquete Sala Mexica (esencial / sonoro / completo).
3. Cámara a pantalla completa. Captura por botón, estabilidad o permanencia en el marco.
4. Análisis vía `LocalVisionModel` en un Web Worker.
5. Resultado con confianza y estado: confirmada por paquete, probable o solo descripción visual.
6. Mapas GeoJSON locales (sin teselas que filtren ubicación). Leyenda: usuario, resguardo, hallazgo, elaboración, lugar representado.

## Modelo local

En **Guías** descarga CLIP (`Xenova/clip-vit-base-patch32`, cuantizado). Los pesos se cachean en el navegador. El modelo solo ordena coincidencias; cultura y fechas salen de las fichas del paquete.

## Versionamiento y despliegue

SemVer en `package.json` (`1.0.0`). GitHub Actions:

- `push` a `main` → build y GitHub Pages.
- tag `v*.*.*` → Pages + GitHub Release con `dist`.

Publicar una versión:

```bash
npm version patch   # o minor / major
git push origin main --tags
```

Variable `VITE_BASE` (por defecto `/mensajes-vivos/`) si el repositorio tiene otro nombre.

## Privacidad

Las capturas viven en memoria hasta que guardas un descubrimiento. GPS solo se compara con geocercas locales. Los mapas no usan teselas de terceros.
