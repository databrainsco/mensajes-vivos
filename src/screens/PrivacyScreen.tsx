import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../app/session'
import { clearDiscoveries, estimateUsage, formatBytes, getPrivacy, setPrivacy } from '../packages/db'

export function PrivacyScreen() {
  const session = useSession()
  const [usage, setUsage] = useState({ usage: 0, quota: 0 })
  const [cleared, setCleared] = useState(false)
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
    <main className="screen stack">
      <p className="kicker">Códice de resguardo</p>
      <h1>Privacidad</h1>
      <p>
        Tus imágenes se procesan en este dispositivo. No se guardan ni se envían a internet, salvo que tú
        decidas conservar un descubrimiento.
      </p>
      <p className="meta">Espacio en este teléfono: {formatBytes(usage.usage)} de {formatBytes(usage.quota)}</p>

      <label className="toggle-row">
        <span>Usar ubicación para detectar museos</span>
        <input
          type="checkbox"
          checked={session.privacy.locationEnabled}
          onChange={(e) => patch({ locationEnabled: e.target.checked, cameraOnly: !e.target.checked })}
        />
      </label>
      <label className="toggle-row">
        <span>Sólo cámara, sin GPS</span>
        <input
          type="checkbox"
          checked={session.privacy.cameraOnly}
          onChange={(e) => patch({ cameraOnly: e.target.checked, locationEnabled: !e.target.checked })}
        />
      </label>
      <label className="toggle-row">
        <span>Vibrar al reconocer una pieza</span>
        <input
          type="checkbox"
          checked={session.privacy.vibrateOnMatch}
          onChange={(e) => patch({ vibrateOnMatch: e.target.checked })}
        />
      </label>

      <button
        className="btn primary row"
        type="button"
        onClick={() => {
          session.setCapture(null)
          void clearDiscoveries().then(() => setCleared(true))
        }}
      >
        Borrar capturas e historial
      </button>
      {cleared && <p className="meta">Historial borrado en este dispositivo.</p>}
      <Link className="btn secondary row" to="/paquetes">Gestionar guías descargadas</Link>
      <Link className="btn ghost row" to="/camara">Volver a la cámara</Link>
    </main>
  )
}
