import { useNavigate } from 'react-router-dom'
import { useSession } from '../app/session'
import { setPrivacy } from '../packages/db'

export function SplashScreen() {
  const nav = useNavigate()
  const session = useSession()

  function enter() {
    const next = { ...session.privacy, introSeen: true }
    session.setPrivacy(next)
    void setPrivacy(next)
    nav('/camara')
  }

  return (
    <main className="screen splash">
      <p className="kicker">México antiguo</p>
      <h1 className="display">Mensajes Vivos</h1>
      <p className="slogan">Mira. Reconoce. Escucha el México antiguo.</p>
      <p className="splash-note">
        Apunta la cámara. El reconocimiento ocurre en este teléfono: no se envían imágenes.
      </p>
      <button className="btn primary row" type="button" onClick={enter}>
        Entrar
      </button>
    </main>
  )
}
