import * as maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import type { GeoPlace, LocationKind } from '../types'
import { MEXICO_OUTLINE } from './mexicoOutline'
import 'maplibre-gl/dist/maplibre-gl.css'

const COLORS: Record<LocationKind, string> = {
  usuario: '#316B5B',
  resguardo: '#B89955',
  hallazgo: '#B8422F',
  elaboracion: '#7B756B',
  representado: '#8aa39a',
}

const LABELS: Record<LocationKind, string> = {
  usuario: 'Tú',
  resguardo: 'Resguardo',
  hallazgo: 'Hallazgo',
  elaboracion: 'Elaboración',
  representado: 'Lugar representado',
}

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap © CARTO',
    },
    mexico: { type: 'geojson', data: MEXICO_OUTLINE },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#d9cfc0' } },
    {
      id: 'mx-fill',
      type: 'fill',
      source: 'mexico',
      paint: { 'fill-color': '#c4b08a', 'fill-opacity': 0.35 },
    },
    { id: 'carto', type: 'raster', source: 'carto' },
    {
      id: 'mx-line',
      type: 'line',
      source: 'mexico',
      paint: { 'line-color': '#7a6a4a', 'line-width': 1.2 },
    },
  ],
}

function kindLabel(kind: LocationKind) {
  return LABELS[kind]
}

function esc(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function popupHtml(kind: LocationKind, place: GeoPlace) {
  const certeza =
    place.certeza === 'exacta'
      ? 'Punto documentado'
      : place.certeza === 'aproximada'
        ? 'Región aproximada'
        : place.certeza === 'propuestas_multiples'
          ? 'Varias propuestas'
          : 'No confirmado'
  const nota = place.nota ? `<p style="margin:0.35rem 0 0;font-size:0.85em;opacity:0.9">${esc(place.nota)}</p>` : ''
  return `<strong>${kindLabel(kind)}</strong><br/>${esc(place.etiqueta)}<br/><span style="opacity:0.8">${certeza}</span>${nota}`
}

export function HistoricalMap({
  user,
  places,
  compact = false,
  focusKind = null,
}: {
  user?: { lng: number; lat: number } | null
  places: Array<{ kind: LocationKind; place: GeoPlace }>
  compact?: boolean
  focusKind?: LocationKind | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<LocationKind, maplibregl.Marker>>(new Map())

  const userKey = user ? `${user.lng},${user.lat}` : ''
  const placeKey = places
    .map((p) => `${p.kind}:${p.place.etiqueta}:${p.place.coordinates?.join(',') ?? ''}`)
    .join('|')

  useEffect(() => {
    if (!ref.current) return
    const pts = places.filter((p) => p.place.coordinates) as Array<{
      kind: LocationKind
      place: GeoPlace & { coordinates: [number, number] }
    }>
    const first = user ?? pts[0]?.place.coordinates ?? [-99.13, 19.43]
    const map = new maplibregl.Map({
      container: ref.current,
      style: STYLE,
      center: Array.isArray(first) ? first : [first.lng, first.lat],
      zoom: compact ? 5.2 : 4.6,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    markersRef.current = new Map()

    const addDot = (lng: number, lat: number, kind: LocationKind, place: GeoPlace) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'map-dot'
      el.style.background = COLORS[kind]
      el.title = `${kindLabel(kind)}: ${place.etiqueta}`
      el.setAttribute('aria-label', `${kindLabel(kind)}: ${place.etiqueta}`)
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 14, maxWidth: '260px' }).setHTML(popupHtml(kind, place)),
        )
        .addTo(map)
      markersRef.current.set(kind, marker)
    }

    map.on('load', () => {
      map.resize()
      if (user) {
        addDot(user.lng, user.lat, 'usuario', {
          etiqueta: 'Tu ubicación',
          certeza: 'aproximada',
        })
      }
      for (const { kind, place } of pts) {
        addDot(place.coordinates[0], place.coordinates[1], kind, place)
      }

      const res = pts.find((p) => p.kind === 'resguardo')
      const hall = pts.find((p) => p.kind === 'hallazgo')
      if (res && hall) {
        map.addSource('viaje', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [hall.place.coordinates, res.place.coordinates],
            },
          },
        })
        map.addLayer({
          id: 'viaje',
          type: 'line',
          source: 'viaje',
          paint: {
            'line-color': '#B8422F',
            'line-width': 2,
            'line-dasharray': [2, 2],
            'line-opacity': 0.85,
          },
        })
      }

      const bounds = new maplibregl.LngLatBounds()
      let n = 0
      if (user) {
        bounds.extend([user.lng, user.lat])
        n += 1
      }
      for (const p of pts) {
        bounds.extend(p.place.coordinates)
        n += 1
      }
      if (n >= 2) {
        map.fitBounds(bounds, { padding: compact ? 36 : 56, maxZoom: compact ? 12 : 13, duration: 0 })
      } else if (n === 1) {
        map.setZoom(compact ? 10 : 11)
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [userKey, placeKey, compact])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !focusKind) return
    let cancelled = false

    const run = () => {
      if (cancelled) return
      const marker = markersRef.current.get(focusKind)
      if (!marker) return false
      const { lng, lat } = marker.getLngLat()
      map.flyTo({
        center: [lng, lat],
        zoom: Math.max(map.getZoom(), compact ? 11 : 12),
        duration: 700,
      })
      for (const [kind, m] of markersRef.current) {
        const popup = m.getPopup()
        if (!popup) continue
        if (kind === focusKind) popup.addTo(map)
        else popup.remove()
      }
      return true
    }

    if (!run()) {
      const onLoad = () => {
        window.setTimeout(run, 0)
      }
      map.once('load', onLoad)
      const t1 = window.setTimeout(run, 120)
      const t2 = window.setTimeout(run, 450)
      return () => {
        cancelled = true
        map.off('load', onLoad)
        window.clearTimeout(t1)
        window.clearTimeout(t2)
      }
    }

    return () => {
      cancelled = true
    }
  }, [focusKind, placeKey, compact])

  const shown = compact
    ? (['resguardo', 'hallazgo'] as const)
    : (['resguardo', 'hallazgo', 'elaboracion', 'representado', 'usuario'] as const)

  return (
    <div id="ficha-mapa" className={`map-wrap ${compact ? 'compact' : ''}`}>
      <div
        ref={ref}
        className={`map-canvas ${compact ? 'mini' : ''}`}
        role="application"
        aria-label="Mapa de resguardo y hallazgo"
      />
      <ul className="legend">
        {shown.map((kind) => (
          <li key={kind}>
            <span style={{ background: COLORS[kind] }} />
            {LABELS[kind]}
          </li>
        ))}
      </ul>
    </div>
  )
}
