import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../app/session'
import { setPrivacy } from '../packages/db'
import { MNA_VENUE } from '../demo/packageData'
import { classifyGeofence } from '../geo/geofence'

export function PermissionsScreen() {
  const nav = useNavigate()
  const session = useSession()
  const [step, setStep] = useState<'camera' | 'explain' | 'gps'>('camera')
  const [msg, setMsg] = useState('')

  async function askCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      stream.getTracks().forEach((t) => t.stop())
      setStep('explain')
    } catch {
      setMsg('Sin cámara no se puede explorar piezas. Puedes reintentar en Ajustes.')
    }
  }

  async function askGps() {
    if (session.privacy.cameraOnly) {
      nav('/camara')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        session.setCoords(coords)
        const hit = classifyGeofence(coords, MNA_VENUE.geofence, MNA_VENUE.nearMeters)
        if (hit.status !== 'outside' && !session.privacy.dismissedGeofences.includes('mna')) {
          nav('/zona')
        } else {
          nav('/camara')
        }
      },
      () => nav('/camara'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <main className="screen stack">
      {step === 'camera' && (
        <>
          <h1>Cámara</h1>
          <p>Necesitamos la cámara trasera para reconocer esculturas, códices y relieves en el propio teléfono.</p>
          <button className="btn primary" type="button" onClick={() => void askCamera()}>Permitir cámara</button>
        </>
      )}
      {step === 'explain' && (
        <>
          <h1>Ubicación</h1>
          <p>
            Pedimos GPS únicamente para saber si estás dentro o cerca de un museo o zona arqueológica y proponerte
            un paquete cultural. Las coordenadas no se envían a internet.
          </p>
          <button className="btn primary" type="button" onClick={() => setStep('gps')}>Entendido</button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              const next = { ...session.privacy, cameraOnly: true, locationEnabled: false }
              session.setPrivacy(next)
              void setPrivacy(next)
              nav('/camara')
            }}
          >
            Utilizar sólo la cámara
          </button>
        </>
      )}
      {step === 'gps' && (
        <>
          <h1>Activar GPS</h1>
          <p>La comparación con geocercas ocurre localmente.</p>
          <button className="btn primary" type="button" onClick={() => void askGps()}>Permitir ubicación</button>
        </>
      )}
      {msg && <p className="warn">{msg}</p>}
    </main>
  )
}
