import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePackage, listPackages } from '../packages/db'
import { useSession } from '../app/session'
import type { InstalledPackage } from '../types'

export function PackagesScreen() {
  const session = useSession()
  const [items, setItems] = useState<InstalledPackage[]>([])
  useEffect(() => {
    void listPackages().then(setItems)
  }, [])
  return (
    <main className="screen stack">
      <h1>Paquetes</h1>
      {items.map((p) => (
        <article key={p.id} className="card">
          <h2>{p.manifest.venueName}</h2>
          <p className="meta">{p.manifest.roomName} · {p.level} · v{p.manifest.version}</p>
          {p.manifest.demo && <p className="badge">Demostración</p>}
          <button className="btn secondary" type="button" onClick={() => session.setActivePackage(p)}>Usar</button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => void deletePackage(p.id).then(() => listPackages().then(setItems))}
          >
            Eliminar
          </button>
        </article>
      ))}
      <Link className="btn primary row" to="/descarga">Descargar o actualizar</Link>
      <Link to="/camara">Cámara</Link>
    </main>
  )
}
