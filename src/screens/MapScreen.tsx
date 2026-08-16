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
      <h1>Mapa histórico</h1>
      <p className="meta">Capas locales GeoJSON. No se consultan teselas externas.</p>
      <HistoricalMap
        user={session.coords ? { lng: session.coords.lng, lat: session.coords.lat } : null}
        places={places}
      />
      <Link to="/resultado">Volver al resultado</Link>
    </main>
  )
}
