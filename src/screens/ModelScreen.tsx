import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLocalVisionModel } from '../vision/LocalVisionModel'
import type { DeviceCapabilities } from '../types'

export function ModelScreen() {
  const [caps, setCaps] = useState<DeviceCapabilities | null>(null)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setProgress((p) => Math.min(100, p + 20)), 200)
    void getLocalVisionModel()
      .getDeviceCapabilities()
      .then(setCaps)
    return () => window.clearInterval(t)
  }, [])
  return (
    <main className="screen stack">
      <h1>Modelo local</h1>
      <p className="badge">Simulación local</p>
      <p>Carga progresiva del adaptador de demostración.</p>
      <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      {caps && (
        <ul>
          <li>WebGPU: {caps.webgpu ? 'disponible' : 'no'}</li>
          <li>WebAssembly: {caps.wasm ? 'disponible' : 'no'}</li>
          <li>Modelo recomendado: {caps.recommendedModel === 'small' ? 'pequeño' : 'completo'}</li>
          {caps.memoryHintMb && <li>Memoria del dispositivo (aprox.): {caps.memoryHintMb} MB</li>}
        </ul>
      )}
      <p className="meta">Sustituye DemoLocalVisionModel por un runtime WebGPU o WASM. Ver README.</p>
      <Link to="/camara">Cámara</Link>
    </main>
  )
}
