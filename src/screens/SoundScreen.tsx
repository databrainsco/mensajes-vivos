import { Link } from 'react-router-dom'
import { SoundPlayer } from '../audio/SoundPlayer'
import { useSession } from '../app/session'
import { PIECES } from '../demo/packageData'
import { cardForVision } from './AnalysisScreen'

export function SoundScreen() {
  const session = useSession()
  const card = cardForVision(session.vision?.identificacion.nombre ?? null, session.activePackage?.pieces ?? PIECES)
  const base = `${import.meta.env.BASE_URL}packages/mna-sala-mexica/`

  return (
    <main className="screen stack">
      <h1>Reproductor sonoro</h1>
      {card?.animales.map((a) => (
        <SoundPlayer
          key={a.nombre}
          title={a.nombre}
          src={a.audio ? base + a.audio : undefined}
          captions={a.nota}
          category="sonido_natural_referencia"
          source="Paquete local de demostración"
          note={a.nota}
        />
      ))}
      {card && card.instrumentos.length === 0 && (
        <SoundPlayer title="Instrumento" source="Paquete local" captions="" />
      )}
      {card?.instrumentos.map((i) => (
        <SoundPlayer
          key={i.nombre}
          title={i.nombre}
          src={i.audio ? base + i.audio : undefined}
          captions={i.nota}
          category={i.categoria}
          source={i.fuente}
          note={i.nota}
        />
      ))}
      {!card && <p>No hay ficha sonora para una descripción visual.</p>}
      <Link to="/resultado">Volver</Link>
    </main>
  )
}
