import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../app/session'
import { clearDiscoveries, estimateUsage, formatBytes, getPrivacy, setPrivacy } from '../packages/db'

export function PrivacyScreen() {
  const session = useSession()
  const [usage, setUsage] = useState({ usage: 0, quota: 0 })
  useEffect(() => {
    void estimateUsage().then(setUsage)
    void getPrivacy().then(session.setPrivacy)
  }, [])

  function patch(partial: Partial<typeof session.privacy>) {
    const next = { ...session.privacy, ...partial }
    session.setPrivacy(next)
    void setPrivacy(next)
  }

  return (
    <main className="screen ivory stack">
      <h1>Privacidad y almacenamiento</h1>
      <p>
        Tus imágenes se procesan en este dispositivo. No se guardan ni se envían a internet, salvo que tú
        decidas conservar un descubrimiento.
      </p>
      <p>Espacio estimado: {formatBytes(usage.usage)} de {formatBytes(usage.quota)}</p>
      <label>
        <input
          type="checkbox"
          checked={session.privacy.locationEnabled}
          onChange={(e) => patch({ locationEnabled: e.target.checked, cameraOnly: !e.target.checked && session.privacy.cameraOnly })}
        />{' '}
        Ubicación activa
      </label>
      <label>
        <input
          type="checkbox"
          checked={session.privacy.cameraOnly}
          onChange={(e) => patch({ cameraOnly: e.target.checked, locationEnabled: !e.target.checked })}
        />{' '}
        Utilizar sólo la cámara
      </label>
      <label>
        <input
          type="checkbox"
          checked={session.privacy.vibrateOnMatch}
          onChange={(e) => patch({ vibrateOnMatch: e.target.checked })}
        />{' '}
        Vibración al reconocer
      </label>
      <button className="btn ghost" type="button" onClick={() => { session.setCapture(null); void clearDiscoveries() }}>
        Borrar capturas e historial
      </button>
      <p className="meta">Revisa permisos del sistema para cámara y ubicación.</p>
      <Link to="/paquetes">Eliminar paquetes</Link>
      <Link to="/camara">Volver</Link>
    </main>
  )
}
