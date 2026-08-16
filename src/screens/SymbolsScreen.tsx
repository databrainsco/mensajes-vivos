import { Link } from 'react-router-dom'
import { useSession } from '../app/session'
import { PIECES } from '../demo/packageData'
import { cardForVision } from './AnalysisScreen'

export function SymbolsScreen() {
  const session = useSession()
  const card = cardForVision(session.vision?.identificacion.nombre ?? null, session.activePackage?.pieces ?? PIECES)
  return (
    <main className="screen ivory stack">
      <h1>Símbolos</h1>
      {!card && <p>Solo se muestran lecturas ligadas a una ficha local.</p>}
      {card?.simbolos.map((s) => (
        <article key={s.id} className="card">
          <h2>{s.titulo}</h2>
          <p>{s.texto}</p>
        </article>
      ))}
      {card?.lamina_secuencia && (
        <p>Secuencia de láminas: {card.lamina_secuencia.join(' → ')}</p>
      )}
      <Link to="/resultado">Volver</Link>
    </main>
  )
}
