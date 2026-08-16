import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearDiscoveries, listDiscoveries } from '../packages/db'
import type { Discovery } from '../types'

export function LibraryScreen() {
  const [items, setItems] = useState<Discovery[]>([])
  useEffect(() => {
    void listDiscoveries().then(setItems)
  }, [])
  return (
    <main className="screen stack">
      <h1>Biblioteca de descubrimientos</h1>
      {items.length === 0 && <p>Aún no guardas piezas. Las capturas no se almacenan solas.</p>}
      {items.map((d) => (
        <article key={d.id} className="card">
          <p>{d.vision.identificacion.nombre ?? 'Descripción visual'}</p>
          <p className="meta">{d.savedAt}</p>
        </article>
      ))}
      <button className="btn ghost" type="button" onClick={() => void clearDiscoveries().then(() => setItems([]))}>
        Borrar historial
      </button>
      <Link to="/camara">Cámara</Link>
    </main>
  )
}
