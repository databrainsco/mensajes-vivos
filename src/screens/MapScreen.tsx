import { Link } from 'react-router-dom'
import { HistoricalMap } from '../maps/HistoricalMap'
import { useSession } from '../app/session'
import { PIECES } from '../demo/packageData'
import { cardForVision } from './AnalysisScreen'

export function MapScreen() {
  const session = useSession()
  const card = cardForVision(session.vision?.identificacion.nombre ?? null, session.activePackage?.pieces ?? PIECES)
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
            La línea punteada une ambos cuando hay coordenadas.
          </p>
          <HistoricalMap
            user={session.coords ? { lng: session.coords.lng, lat: session.coords.lat } : null}
            places={places}
          />
          <section className="card">
            <h2>Resguardo</h2>
            <p>{card.lugares.resguardo.etiqueta}</p>
            {card.lugares.resguardo.nota && <p>{card.lugares.resguardo.nota}</p>}
          </section>
          <section className="card">
            <h2>Hallazgo</h2>
            <p>{card.lugares.hallazgo.etiqueta}</p>
            {card.lugares.hallazgo.nota && <p>{card.lugares.hallazgo.nota}</p>}
          </section>
        </>
      ) : (
        <p>Identifica una pieza para ver su mapa de hallazgo y resguardo.</p>
      )}
      <Link className="btn ghost row" to="/resultado">Volver a la ficha</Link>
    </main>
  )
}
