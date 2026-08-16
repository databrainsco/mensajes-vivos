import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatBytes } from '../packages/db'
import { VISION_MODEL } from '../vision/modelCatalog'
import { deleteVisionModel, downloadVisionModel, getInstalledModel, pauseModelDownload, type ModelProgress } from '../vision/modelDownload'
import { getLocalVisionModel } from '../vision/LocalVisionModel'
import type { DeviceCapabilities } from '../types'
import type { ModelRecord } from '../vision/modelStore'

export function ModelScreen() {
  const [record, setRecord] = useState<ModelRecord | null>(null)
  const [caps, setCaps] = useState<DeviceCapabilities | null>(null)
  const [progress, setProgress] = useState<ModelProgress | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [mobileOk, setMobileOk] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    void getInstalledModel().then(setRecord)
    void getLocalVisionModel().getDeviceCapabilities().then(setCaps)
  }, [])

  async function download() {
    setError('')
    setBusy(true)
    try {
      await downloadVisionModel(setProgress)
      setRecord(await getInstalledModel())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar el modelo')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const pct = progress && progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0

  return (
    <main className="screen stack">
      <p className="kicker">Cerebro local</p>
      <h1>Modelo de reconocimiento</h1>
      <p>
        Descarga el modelo CLIP en este teléfono. Después reconoce piezas sin enviar fotos. Los pesos se obtienen
        una sola vez; el análisis es local.
      </p>
      <article className="card">
        <h2>{VISION_MODEL.name}</h2>
        <p className="meta">{formatBytes(VISION_MODEL.bytes)} · {VISION_MODEL.label}</p>
        {record?.ready ? (
          <p className="badge">Listo en este dispositivo</p>
        ) : (
          <p className="badge">No descargado</p>
        )}
      </article>
      {caps && (
        <p className="meta">
          WebGPU: {caps.webgpu ? 'sí' : 'no'} · WASM: {caps.wasm ? 'sí' : 'no'} · se recomienda el modelo pequeño
        </p>
      )}
      {busy && (
        <>
          <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="meta">{paused ? 'Pausa' : `Descargando ${progress?.file ?? 'modelo'} · ${pct}%`}</p>
          <button className="btn ghost row" type="button"
            onClick={() => {
              const next = !paused
              setPaused(next)
              pauseModelDownload(next)
            }}
          >
            {paused ? 'Reanudar descarga' : 'Pausar descarga'}
          </button>
        </>
      )}
      {error && <p className="warn">{error === 'aborted' ? 'Descarga cancelada.' : error}</p>}
      {!record?.ready && !busy && (
        <>
          <label className="toggle-row">
            <span>Confirmo si estoy en datos móviles (~92 MB)</span>
            <input type="checkbox" checked={mobileOk} onChange={(e) => setMobileOk(e.target.checked)} />
          </label>
          <button className="btn primary row" type="button" disabled={!mobileOk} onClick={() => void download()}>
            Descargar modelo
          </button>
        </>
      )}
      {record?.ready && (
        <button
          className="btn ghost row"
          type="button"
          onClick={() => void deleteVisionModel().then(() => getInstalledModel().then(setRecord))}
        >
          Eliminar modelo de este teléfono
        </button>
      )}
      <Link className="btn secondary row" to="/camara">Volver a la cámara</Link>
      <Link className="btn ghost row" to="/paquetes">Ver guías culturales</Link>
    </main>
  )
}
