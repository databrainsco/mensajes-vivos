import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MANIFEST } from '../demo/packageData'
import { formatBytes, levelSize } from '../packages/db'
import type { PackageLevel } from '../types'
import { useSession } from '../app/session'

export function DownloadChoiceScreen() {
  const nav = useNavigate()
  const session = useSession()
  const [level, setLevel] = useState<PackageLevel>(session.pendingLevel)
  const [mobileOk, setMobileOk] = useState(false)
  const size = levelSize(level, MANIFEST.levels)

  return (
    <main className="screen stack">
      <h1>Paquete Sala Mexica</h1>
      <p className="badge">Demostración con datos precargados</p>
      {(['esencial', 'sonoro', 'completo'] as const).map((l) => (
        <label key={l} className="card">
          <input
            type="radio"
            name="level"
            checked={level === l}
            onChange={() => setLevel(l)}
          />{' '}
          {l} · {formatBytes(levelSize(l, MANIFEST.levels))} · {MANIFEST.levels[l].label}
        </label>
      ))}
      <p>Tamaño a descargar: {formatBytes(size)}</p>
      <label>
        <input type="checkbox" checked={mobileOk} onChange={(e) => setMobileOk(e.target.checked)} />{' '}
        Confirmo si estoy en datos móviles
      </label>
      <button
        className="btn primary"
        type="button"
        disabled={!mobileOk}
        onClick={() => {
          session.setPendingLevel(level)
          nav('/progreso')
        }}
      >
        Descargar
      </button>
    </main>
  )
}
