import { Link } from 'react-router-dom'
import { useSession } from '../app/session'
import { setPrivacy } from '../packages/db'

export function IntroScreen() {
  const session = useSession()
  return (
    <main className="screen ivory stack">
      <p className="kicker">Privacidad</p>
      <h1>Tus imágenes se quedan aquí</h1>
      <p>
        Tus imágenes se procesan en este dispositivo. No se guardan ni se envían a internet, salvo que tú
        decidas conservar un descubrimiento.
      </p>
      <p>No usamos reconocimiento facial. El GPS solo compara coordenadas con geocercas descargadas en el teléfono.</p>
      <Link
        className="btn primary row"
        to="/permisos"
        onClick={() => {
          const next = { ...session.privacy, introSeen: true }
          session.setPrivacy(next)
          void setPrivacy(next)
        }}
      >
        Continuar
      </Link>
    </main>
  )
}
