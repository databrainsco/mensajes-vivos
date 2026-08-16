import { Link } from 'react-router-dom'
import { MANIFEST } from '../demo/packageData'
import { formatBytes, levelSize } from '../packages/db'
import { useSession } from '../app/session'

export function ZoneScreen() {
  const { pendingLevel } = useSession()
  const size = levelSize(pendingLevel, MANIFEST.levels)
  return (
    <main className="screen stack">
      <p className="kicker">Zona detectada</p>
      <h1>Estás cerca del Museo Nacional de Antropología.</h1>
      <p>
        Descarga la guía local para reconocer mejor las piezas y utilizarla sin internet.
      </p>
      <div className="card">
        <strong>Sala Mexica</strong>
        <p className="meta">
          {formatBytes(size)} · {MANIFEST.stats.piezas} piezas · {MANIFEST.stats.audios} audios · mapa incluido
        </p>
      </div>
      <Link className="btn primary row" to="/descarga">Descargar</Link>
      <Link className="btn ghost row" to="/camara">Continuar sin descargar</Link>
      <Link className="btn ghost row" to="/camara" state={{ dismiss: 'mna' }}>
        No volver a preguntar aquí
      </Link>
    </main>
  )
}
