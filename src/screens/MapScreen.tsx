import { Link } from 'react-router-dom'
import { useState } from 'react'
import { HistoricalMap } from '../maps/HistoricalMap'
import { useSession } from '../app/session'
import { PIECES } from '../demo/packageData'
import { cardForVision } from './AnalysisScreen'
import type { GeoPlace, LocationKind } from '../types'

function PlaceRow({
  title,
  place,
  kind,
  active,
  onSelect,
}: {
  title: string
  place: GeoPlace
  kind: LocationKind
  active: boolean
  onSelect: (kind: LocationKind) => void
}) {
  const hasPoint = Boolean(place.coordinates)
  return (
    <button
      type="button"
      className={`place-block ${active ? 'active' : ''} ${hasPoint ? '' : 'disabled'}`}
      disabled={!hasPoint}
      onClick={() => {
        if (!hasPoint) return
        onSelect(kind)
        document.getElementById('ficha-mapa')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }}
    >
      <h2>{title}</h2>
      <p className="meta">{hasPoint ? 'Toca para centrar el mapa' : 'Sin punto en el mapa'}</p>
      <p>{place.etiqueta}</p>
      {place.nota && <p>{place.nota}</p>}
    </button>
  )
}

export function MapScreen() {
  const session = useSession()
  const card = cardForVision(session.vision?.identificacion.nombre ?? null, session.activePackage?.pieces ?? PIECES)
  const [focusKind, setFocusKind] = useState<LocationKind | null>(null)
  const places = card
    ? [
        { kind: 'resguardo' as const, place: card.lugares.resguardo },
        { kind: 'hallazgo' as const, place: card.lugares.hallazgo },
        ...(card.lugares.elaboracion ? [{ kind: 'elaboracion' as const, place: card.lugares.elaboracion }] : []),
        ...(card.lugares.representado ? [{ kind: 'representado' as const, place: card.lugares.representado }] : []),
      ]
    : []

  return (
    <main className="screen stack">
      <p className="kicker">{card?.nombre ?? 'Mapa'}</p>
      <h1>De dónde viene y dónde está</h1>
      {card ? (
        <>
          <p>
            El punto rojo es el hallazgo o la región asociada. El punto dorado es el resguardo actual.
            Toca un lugar de la lista o un punto del mapa para verlo de cerca.
          </p>
          <HistoricalMap
            focusKind={focusKind}
            user={session.coords ? { lng: session.coords.lng, lat: session.coords.lat } : null}
            places={places}
          />
          <section className="card stack">
            <PlaceRow
              title="Resguardo"
              place={card.lugares.resguardo}
              kind="resguardo"
              active={focusKind === 'resguardo'}
              onSelect={setFocusKind}
            />
            <PlaceRow
              title="Hallazgo"
              place={card.lugares.hallazgo}
              kind="hallazgo"
              active={focusKind === 'hallazgo'}
              onSelect={setFocusKind}
            />
            {card.lugares.elaboracion && (
              <PlaceRow
                title="Elaboración"
                place={card.lugares.elaboracion}
                kind="elaboracion"
                active={focusKind === 'elaboracion'}
                onSelect={setFocusKind}
              />
            )}
          </section>
        </>
      ) : (
        <p>Identifica una pieza para ver su mapa de hallazgo y resguardo.</p>
      )}
      <Link className="btn ghost row" to="/resultado">Volver a la ficha</Link>
    </main>
  )
}
