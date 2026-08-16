import { Link } from 'react-router-dom'

export function SplashScreen() {
  return (
    <main className="screen stack" style={{ justifyContent: 'center', minHeight: '100dvh' }}>
      <p className="kicker">PWA cultural</p>
      <h1 className="display">Mensajes Vivos</h1>
      <p className="slogan">Mira. Reconoce. Escucha el México antiguo.</p>
      <span className="badge">Procesamiento local</span>
      <Link className="btn primary row" to="/intro">Entrar</Link>
    </main>
  )
}
