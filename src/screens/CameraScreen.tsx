import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../app/session'
import { getPrivacy, setPrivacy } from '../packages/db'
import { downscaleCanvas, estimateBrightness, VisionClient } from '../vision/client'

export function CameraScreen() {
  const nav = useNavigate()
  const loc = useLocation()
  const session = useSession()
  const video = useRef<HTMLVideoElement>(null)
  const client = useRef(new VisionClient())
  const [modelState, setModelState] = useState('Cargando modelo local…')
  const [torch, setTorch] = useState(false)
  const [batteryWarn, setBatteryWarn] = useState(false)
  const dwell = useRef(0)
  const lastMotion = useRef(0)

  useEffect(() => {
    const st = loc.state as { dismiss?: string } | null
    if (st?.dismiss) {
      const next = { ...session.privacy, dismissedGeofences: [...session.privacy.dismissedGeofences, st.dismiss] }
      session.setPrivacy(next)
      void setPrivacy(next)
    }
  }, [loc.state, session])

  useEffect(() => {
    let stream: MediaStream | null = null
    void (async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      if (video.current) video.current.srcObject = stream
      await client.current.load()
      setModelState('Simulación local lista')
      const stored = await getPrivacy()
      session.setPrivacy(stored)
    })()
    void navigator.getBattery?.().then((b) => {
      if (b.level < 0.15) setBatteryWarn(true)
    })
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
      void client.current.release()
    }
  }, [])

  async function capture(reason: string) {
    const v = video.current
    if (!v || !v.videoWidth) return
    const small = downscaleCanvas(v, 384)
    const bright = estimateBrightness(small)
    if (bright < 0.08 && reason !== 'button') return
    session.setCapture(small.toDataURL('image/jpeg', 0.7))
    const hint =
      session.demoHint === 'ocelotl'
        ? ['jaguar', 'cuauhxicalli']
        : session.demoHint === 'xolotl'
          ? ['xolotl', 'codice', 'fejervary']
          : ['coatlicue', 'serpiente']
    session.setVision(null)
    nav('/analisis', { state: { cues: hint, width: small.width, height: small.height } })
  }

  useEffect(() => {
    const id = window.setInterval(() => {
      lastMotion.current += 1
      if (lastMotion.current > 3) dwell.current += 1
      else dwell.current = 0
      if (dwell.current >= 4) {
        dwell.current = 0
        void capture('dwell')
      }
    }, 700)
    const onDev = () => {
      lastMotion.current = 0
    }
    window.addEventListener('devicemotion', onDev)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('devicemotion', onDev)
    }
  }, [session.demoHint])

  async function toggleTorch() {
    const v = video.current
    const track = (v?.srcObject as MediaStream | null)?.getVideoTracks()[0]
    const caps = track?.getCapabilities?.() as { torch?: boolean } | undefined
    if (track && caps?.torch) {
      await track.applyConstraints({ advanced: [{ torch: !torch }] as never })
      setTorch(!torch)
    }
  }

  return (
    <div className="camera-root">
      <video ref={video} autoPlay playsInline muted aria-label="Cámara de exploración" />
      <div className="hud">
        <header>
          <strong>Mensajes Vivos</strong>
          <p className="tiny">{session.activePackage ? session.activePackage.manifest.roomName : 'Sin paquete activo'}</p>
          <p className="tiny">{modelState} · Procesando en este dispositivo</p>
          {session.activePackage?.manifest.demo && <p className="badge">Demostración con datos precargados</p>}
          {batteryWarn && <p className="warn">Batería baja: el análisis puede pausarse.</p>}
        </header>
        <div className="frame" aria-hidden="true" />
        <div>
          <label className="tiny">
            Demo{' '}
            <select
              value={session.demoHint}
              onChange={(e) => session.setDemoHint(e.target.value as typeof session.demoHint)}
              aria-label="Pieza de demostración"
            >
              <option value="coatlicue">Coatlicue</option>
              <option value="ocelotl">Océlotl Cuauhxicalli</option>
              <option value="xolotl">Xólotl / códice</option>
              <option value="none">Descripción visual</option>
            </select>
          </label>
          <div className="hud-bottom">
            <Link className="btn ghost" to="/paquetes" aria-label="Paquetes descargados">▣</Link>
            <button className="capture" type="button" aria-label="Capturar" onClick={() => void capture('button')} />
            <button className="btn ghost" type="button" aria-label="Iluminación" onClick={() => void toggleTorch()}>
              {torch ? '●' : '○'}
            </button>
          </div>
          <nav className="stack" style={{ marginTop: '0.6rem' }}>
            <Link className="tiny" to="/privacidad">Privacidad</Link>
            <Link className="tiny" to="/modelo">Estado del modelo</Link>
            <Link className="tiny" to="/biblioteca">Descubrimientos</Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
