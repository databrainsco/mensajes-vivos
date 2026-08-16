import { Link } from 'react-router-dom'
import { SoundPlayer } from '../audio/SoundPlayer'
import { useSession } from '../app/session'
import { PIECES } from '../demo/packageData'
import { cardForVision } from './AnalysisScreen'

export function SoundScreen() {
  const session = useSession()
  const card = cardForVision(session.vision?.identificacion.nombre ?? null, session.activePackage?.pieces ?? PIECES)
  const base = `${import.meta.env.BASE_URL}packages/mna-sala-mexica/`
  const animals = card?.animales ?? []
  const instruments = card?.instrumentos ?? []

  return (
    <main className="screen stack">
      <p className="kicker">Sonidos</p>
      <h1>{card?.nombre ?? 'Reproductor'}</h1>

      {!card && <p>No hay ficha sonora porque no se identificó una pieza.</p>}

      {card && animals.length === 0 && instruments.length === 0 && (
        <p>Esta ficha no incluye animales ni instrumentos documentados.</p>
      )}

      {animals.map((a) => (
        <SoundPlayer
          key={a.nombre}
          title={a.nombre}
          src={a.audio ? base + a.audio : undefined}
          captions={a.nota}
          category="sonido_natural_referencia"
          source="Paquete local"
          note={a.nota}
        />
      ))}

      {instruments.map((i) => (
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

      <Link className="btn ghost row" to="/resultado">Volver a la ficha</Link>
    </main>
  )
}
