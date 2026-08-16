import * as maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import type { GeoPlace, LocationKind } from '../types'
import 'maplibre-gl/dist/maplibre-gl.css'

const COLORS: Record<LocationKind, string> = {
  usuario: '#316B5B',
  resguardo: '#B89955',
  hallazgo: '#B8422F',
  elaboracion: '#7B756B',
  representado: '#F4EEDF',
}

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#2a2622' } }],
}

export function HistoricalMap({
  user,
  places,
}: {
  user?: { lng: number; lat: number } | null
  places: Array<{ kind: LocationKind; place: GeoPlace }>
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const map = new maplibregl.Map({
      container: ref.current,
      style: STYLE,
      center: user ?? places.find((p) => p.place.coordinates)?.place.coordinates ?? [-99.13, 19.43],
      zoom: 4.2,
      attributionControl: false,
    })

    const addDot = (lng: number, lat: number, color: string, label: string) => {
      const el = document.createElement('div')
      el.className = 'map-dot'
      el.style.background = color
      el.title = label
      el.setAttribute('role', 'img')
      el.setAttribute('aria-label', label)
      new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)
    }

    map.on('load', () => {
      if (user) addDot(user.lng, user.lat, COLORS.usuario, 'Ubicación actual')
      for (const { kind, place } of places) {
        if (place.certeza === 'desconocida' && !place.coordinates) continue
        if (place.coordinates && (place.certeza === 'exacta' || place.certeza === 'aproximada')) {
          addDot(place.coordinates[0], place.coordinates[1], COLORS[kind], `${kind}: ${place.etiqueta}`)
        }
      }
    })

    return () => map.remove()
  }, [user, places])

  const uncertain = places.some((p) => p.place.certeza !== 'exacta')

  return (
    <div className="map-wrap">
      <div ref={ref} className="map-canvas" role="application" aria-label="Mapa histórico local" />
      <ul className="legend">
        <li><span style={{ background: COLORS.usuario }} /> Ubicación actual</li>
        <li><span style={{ background: COLORS.resguardo }} /> Resguardo</li>
        <li><span style={{ background: COLORS.hallazgo }} /> Hallazgo</li>
        <li><span style={{ background: COLORS.elaboracion }} /> Elaboración (región)</li>
        <li><span style={{ background: COLORS.representado }} /> Lugar representado</li>
      </ul>
      {uncertain && (
        <p className="warn">
          Ubicación histórica no confirmada. El mapa representa propuestas o una región aproximada.
        </p>
      )}
    </div>
  )
}
