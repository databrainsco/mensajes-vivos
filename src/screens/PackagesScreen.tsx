import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePackage, formatBytes, listPackages } from '../packages/db'
import { useSession } from '../app/session'
import type { InstalledPackage } from '../types'
import { VISION_MODEL } from '../vision/modelCatalog'
import { getInstalledModel } from '../vision/modelDownload'
import type { ModelRecord } from '../vision/modelStore'

export function PackagesScreen() {
  const session = useSession()
  const [items, setItems] = useState<InstalledPackage[]>([])
  const [model, setModel] = useState<ModelRecord | null>(null)
  useEffect(() => {
    void listPackages().then(setItems)
    void getInstalledModel().then(setModel)
  }, [])
  return (
    <main className="screen stack">
      <p className="kicker">Descargas</p>
      <h1>Guías y modelo</h1>

      <article className="card">
        <h2>{VISION_MODEL.name}</h2>
        <p className="meta">{formatBytes(VISION_MODEL.bytes)} · necesario para reconocer piezas</p>
        {model?.ready ? <p className="badge">Modelo listo</p> : <p className="badge">Falta descargar</p>}
        <Link className="btn primary row" to="/modelo">
          {model?.ready ? 'Administrar modelo' : 'Descargar modelo local'}
        </Link>
      </article>

      <h2>Guías de museo</h2>
      {items.map((p) => (
        <article key={p.id} className="card">
          <h2>{p.manifest.venueName}</h2>
          <p className="meta">{p.manifest.roomName} · {p.level} · v{p.manifest.version}</p>
          {p.manifest.demo && <p className="badge">Demostración</p>}
          <button className="btn secondary row" type="button" onClick={() => session.setActivePackage(p)}>Usar guía</button>
          <button
            className="btn ghost row"
            type="button"
            onClick={() => void deletePackage(p.id).then(() => listPackages().then(setItems))}
          >
            Eliminar guía
          </button>
        </article>
      ))}
      <Link className="btn ghost row" to="/descarga">Descargar o actualizar guía</Link>
      <Link className="btn secondary row" to="/camara">Cámara</Link>
    </main>
  )
}
