import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../app/session'
import { getPrivacy, setPrivacy } from '../packages/db'
import { MNA_VENUE } from '../demo/packageData'
import { classifyGeofence } from '../geo/geofence'
import { downscaleCanvas, estimateBrightness, VisionClient } from '../vision/client'
import type { VisionResult } from '../types'

export function CameraScreen() {
  const nav = useNavigate()
  const loc = useLocation()
  const session = useSession()
  const video = useRef<HTMLVideoElement>(null)
  const client = useRef(new VisionClient())
  const busy = useRef(false)
  const lastMotion = useRef(0)
  const [status, setStatus] = useState('Iniciando cámara…')
  const [torch, setTorch] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [live, setLive] = useState<VisionResult | null>(null)
  const [zone, setZone] = useState(false)
  const [camError, setCamError] = useState('')

  useEffect(() => {
    const st = loc.state as { dismiss?: string } | null
    if (st?.dismiss) {
      const next = { ...session.privacy, dismissedGeofences: [...session.privacy.dismissedGeofences, st.dismiss] }
      session.setPrivacy(next)
      void setPrivacy(next)
    }
  }, [loc.state])

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        if (video.current) {
          video.current.srcObject = stream
          await video.current.play()
        }
        await client.current.load()
        setStatus('Detectando en este dispositivo')
        const stored = await getPrivacy()
        session.setPrivacy(stored)
        if (stored.locationEnabled && !stored.cameraOnly) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
              session.setCoords(coords)
              const hit = classifyGeofence(coords, MNA_VENUE.geofence, MNA_VENUE.nearMeters)
              if (hit.status !== 'outside' && !stored.dismissedGeofences.includes('mna')) setZone(true)
            },
            () => undefined,
            { enableHighAccuracy: true, timeout: 6000 },
          )
        }
      } catch {
        setCamError('Activa la cámara en Ajustes para reconocer piezas.')
        setStatus('Sin cámara')
      }
    })()
    const onDev = () => {
      lastMotion.current = performance.now()
    }
    window.addEventListener('devicemotion', onDev)
    return () => {
      cancelled = true
      window.removeEventListener('devicemotion', onDev)
      stream?.getTracks().forEach((t) => t.stop())
      void client.current.release()
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      void tick()
    }, 900)
    return () => window.clearInterval(id)
  }, [])

  async function tick() {
    const v = video.current
    if (!v || !v.videoWidth || busy.current || camError) return
    if (performance.now() - lastMotion.current < 280) return
    const small = downscaleCanvas(v, 320)
    if (estimateBrightness(small) < 0.07) {
      setStatus('Busca más luz')
      return
    }
    const ctx = small.getContext('2d')
    if (!ctx) return
    const image = ctx.getImageData(0, 0, small.width, small.height)
    busy.current = true
    setScanning(true)
    setStatus('Reconociendo…')
    try {
      const vision = await client.current.analyze({
        image,
        packageId: session.activePackage?.id,
        width: small.width,
        height: small.height,
      })
      session.setVision(vision)
      session.setCapture(small.toDataURL('image/jpeg', 0.65))
      setLive(vision)
      setStatus('Detectando en este dispositivo')
    } catch {
      setStatus('Esperando escena estable')
    } finally {
      busy.current = false
      setScanning(false)
    }
  }

  async function toggleTorch() {
    const track = (video.current?.srcObject as MediaStream | null)?.getVideoTracks()[0]
    const caps = track?.getCapabilities?.() as { torch?: boolean } | undefined
    if (track && caps?.torch) {
      await track.applyConstraints({ advanced: [{ torch: !torch }] as never })
      setTorch(!torch)
    }
  }

  const label = live?.identificacion.nombre
  const hint =
    live?.identificacion.estado === 'confirmada_por_paquete'
      ? 'Coincidencia con ficha local'
      : live?.identificacion.estado === 'identificacion_probable'
        ? 'Identificación probable'
        : live
          ? live.descripcion_visible
          : 'Apunta a una escultura, códice o relieve'

  return (
    <div className="camera-root">
      <video ref={video} autoPlay playsInline muted aria-label="Exploración en vivo" />
      <div className={`scanner ${scanning ? 'active' : 'idle'}`} aria-hidden="true">
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <span className="laser" />
      </div>
      <div className="hud live">
        <header className="hud-top">
          <div>
            <strong>Mensajes Vivos</strong>
            <p className="tiny">{status}</p>
          </div>
          <div className="hud-actions">
            <button className="icon-btn" type="button" aria-label="Antorcha" onClick={() => void toggleTorch()}>
              {torch ? 'Apagar antorcha' : 'Antorcha'}
            </button>
            <Link className="icon-btn" to="/paquetes" aria-label="Guías">Guías</Link>
            <Link className="icon-btn" to="/privacidad" aria-label="Privacidad">Privacidad</Link>
          </div>
        </header>
        {zone && (
          <div className="zone-banner">
            <p>Cerca del Museo Nacional de Antropología. Puedes descargar la guía para usarla sin internet.</p>
            <div className="hud-actions">
              <Link className="btn primary" to="/descarga">Descargar guía</Link>
              <button className="btn ghost" type="button" onClick={() => setZone(false)}>Ahora no</button>
            </div>
          </div>
        )}
        {camError && <p className="warn cam-error">{camError}</p>}
        <button
          className="detect-card"
          type="button"
          onClick={() => {
            if (live) nav('/resultado')
          }}
        >
          <span className="kicker">{scanning ? 'Escaneando la pieza' : 'Reconocimiento'}</span>
          <strong>{label ?? 'Apunta hacia la pieza'}</strong>
          <span className="tiny">{hint}</span>
          {live?.identificacion.confianza ? (
            <span className="tiny">{Math.round(live.identificacion.confianza * 100)}% de confianza · toca para abrir la ficha</span>
          ) : null}
        </button>
      </div>
    </div>
  )
}
