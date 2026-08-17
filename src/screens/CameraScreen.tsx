import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../app/session'
import { getPrivacy, setPrivacy } from '../packages/db'
import { MNA_VENUE } from '../demo/packageData'
import { classifyGeofence } from '../geo/geofence'
import { getInstalledModel } from '../vision/modelDownload'
import { downscaleCanvas, estimateBrightness, VisionClient } from '../vision/client'
import { resultKey, stabilizeScan } from '../vision/recognition'
import type { ObjectType, VisionResult } from '../types'

const TYPE_TITLE: Partial<Record<ObjectType, string>> = {
  escultura: 'Escultura de piedra',
  relieve: 'Relieve o estela',
  codice: 'Códice pictográfico',
  glifo: 'Glifo',
  deidad: 'Deidad (pictografía)',
  vasija: 'Cerámica',
  instrumento: 'Instrumento musical',
  arquitectura: 'Arquitectura',
  mascara: 'Máscara',
  figurilla: 'Figurilla',
}

export function CameraScreen() {
  const nav = useNavigate()
  const loc = useLocation()
  const session = useSession()
  const video = useRef<HTMLVideoElement>(null)
  const client = useRef(new VisionClient())
  const busy = useRef(false)
  const readyRef = useRef(false)
  const usingClipRef = useRef(false)
  const historyRef = useRef<string[]>([])
  const displayedRef = useRef<VisionResult | null>(null)
  const [status, setStatus] = useState('Iniciando cámara…')
  const [torch, setTorch] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [live, setLive] = useState<VisionResult | null>(null)
  const [zone, setZone] = useState(false)
  const [camError, setCamError] = useState('')
  const [modelReady, setModelReady] = useState(false)
  const [usingClip, setUsingClip] = useState(false)

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
    readyRef.current = false

    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
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
        setStatus('Cargando reconocimiento…')

        const installed = await getInstalledModel()
        const wantClip = Boolean(installed?.ready)
        setModelReady(wantClip)

        const loaded = await client.current.load(wantClip)
        if (cancelled) return
        setUsingClip(loaded.clip)
        usingClipRef.current = loaded.clip
        readyRef.current = true

        if (wantClip && loaded.clip) {
          setStatus('Detectando con modelo local')
        } else if (wantClip && !loaded.clip) {
          setStatus('Modelo no cargó; modo local básico')
        } else {
          setStatus('Modo local básico · descarga CLIP en Guías')
        }

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
      } catch (error) {
        setCamError('Activa la cámara en Ajustes para reconocer piezas.')
        setStatus(`Sin cámara (${String(error).slice(0, 80)})`)
      }
    })()

    return () => {
      cancelled = true
      readyRef.current = false
      historyRef.current = []
      displayedRef.current = null
      stream?.getTracks().forEach((t) => t.stop())
      void client.current.release()
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      void tick()
    }, 2000)
    return () => window.clearInterval(id)
  }, [])

  async function tick() {
    const v = video.current
    if (!v || !v.videoWidth || busy.current || camError || !readyRef.current) return

    const small = downscaleCanvas(v, 384)
    if (estimateBrightness(small) < 0.05) {
      setStatus('Busca más luz')
      return
    }
    const ctx = small.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const image = ctx.getImageData(0, 0, small.width, small.height)

    busy.current = true
    setScanning(true)
    setStatus(usingClipRef.current ? 'Reconociendo con CLIP…' : 'Reconociendo…')
    try {
      const vision = await client.current.analyze({
        image,
        packageId: session.activePackage?.id,
        width: small.width,
        height: small.height,
      })
      const next = stabilizeScan(historyRef.current, vision, displayedRef.current)
      historyRef.current = next.historyKeys
      const holdingName =
        Boolean(displayedRef.current?.identificacion.nombre) &&
        displayedRef.current?.identificacion.nombre === next.displayed.identificacion.nombre &&
        resultKey(vision) !== resultKey(next.displayed)
      displayedRef.current = next.displayed
      session.setVision(next.displayed)
      if (!holdingName) session.setCapture(small.toDataURL('image/jpeg', 0.7))
      setLive(next.displayed)
      if (next.displayed.identificacion.nombre) {
        setStatus(
          next.displayed.identificacion.estado === 'confirmada_por_paquete'
            ? `Coincide: ${next.displayed.identificacion.nombre}`
            : `Posible: ${next.displayed.identificacion.nombre}`,
        )
        if (session.privacy.vibrateOnMatch && next.displayed.identificacion.estado === 'confirmada_por_paquete') {
          navigator.vibrate?.(30)
        }
      } else if (next.displayed.tipo_objeto !== 'objeto_desconocido') {
        setStatus('Tipo probable · se espera otra toma igual para la ficha')
      } else {
        setStatus('Sin ficha · no se inventa una pieza')
      }
    } catch (error) {
      setStatus(`Error al analizar: ${String(error).slice(0, 60)}`)
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

  const named = live?.identificacion.nombre ?? null
  const typeOnly = Boolean(live && !named && live.tipo_objeto !== 'objeto_desconocido')
  const label = named ?? (typeOnly ? (TYPE_TITLE[live!.tipo_objeto] ?? 'Objeto patrimonial') : null)
  const hint =
    live?.identificacion.estado === 'confirmada_por_paquete'
      ? 'Coincidencia estable con ficha local · toca para abrir'
      : live?.identificacion.estado === 'identificacion_probable'
        ? 'Probable · verifica la ficha antes de aceptarla'
        : typeOnly
          ? live?.descripcion_visible ?? 'Se ve el tipo, no la pieza. Mantén el encuadre.'
          : live
            ? live.descripcion_visible
            : modelReady
              ? 'Índice de museo local · acerca la pieza'
              : 'Sin CLIP no se propone identidad. Descárgalo en Guías.'

  const kicker =
    scanning
      ? 'Escaneando'
      : named
        ? live?.identificacion.estado === 'confirmada_por_paquete'
          ? 'Confirmado'
          : 'Probable'
        : typeOnly
          ? 'Tipo probable'
          : 'Sin identificación'

  return (
    <div className="camera-root">
      <video ref={video} autoPlay playsInline muted aria-label="Exploración en vivo" />
      <div className="hud live">
        <header className="hud-top">
          <div>
            <strong>Mensajes Vivos</strong>
            <p className="tiny">{status}</p>
            <p className="tiny">{usingClip ? 'CLIP en este dispositivo' : 'Respaldo local'}</p>
          </div>
          <div className="hud-actions">
            <button className="icon-btn" type="button" aria-label="Antorcha" onClick={() => void toggleTorch()}>
              {torch ? 'Luz off' : 'Luz'}
            </button>
            <Link className="icon-btn" to="/paquetes" aria-label="Guías">Guías</Link>
            <Link className="icon-btn" to="/privacidad" aria-label="Privacidad">Privacidad</Link>
          </div>
          {zone && (
            <div className="zone-banner">
              <p>Cerca del Museo Nacional de Antropología. Puedes descargar la guía para usarla sin internet.</p>
              <div className="hud-actions">
                <Link className="btn primary" to="/descarga">Descargar guía</Link>
                <button className="btn ghost" type="button" onClick={() => setZone(false)}>Ahora no</button>
              </div>
            </div>
          )}
        </header>
        <div className={`scanner ${scanning ? 'active' : 'idle'}`} aria-hidden="true">
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
          <span className="laser" />
        </div>
        {camError && <p className="warn cam-error">{camError}</p>}
        <button
          className="detect-card"
          type="button"
          onClick={() => {
            if (live?.identificacion.nombre) nav('/resultado')
            else if (!modelReady) nav('/modelo')
          }}
        >
          <span className="kicker">{kicker}</span>
          <strong>
            {label ?? (modelReady ? 'Pieza no identificada' : 'Descarga el modelo CLIP')}
          </strong>
          <span className="tiny">{hint}</span>
          {named && live?.identificacion.confianza ? (
            <span className="tiny">{Math.round(live.identificacion.confianza * 100)}% de confianza</span>
          ) : null}
        </button>
      </div>
    </div>
  )
}
