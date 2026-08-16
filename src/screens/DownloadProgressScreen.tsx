import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { downloadDemoPackage, type DownloadProgress } from '../packages/catalog'
import { useSession } from '../app/session'

export function DownloadProgressScreen() {
  const nav = useNavigate()
  const session = useSession()
  const [progress, setProgress] = useState<DownloadProgress>({ loaded: 0, total: 1, paused: false })
  const signal = useRef({ paused: false, aborted: false })

  useEffect(() => {
    let cancelled = false
    void downloadDemoPackage(session.pendingLevel, setProgress, signal.current)
      .then((pkg) => {
        if (cancelled) return
        session.setActivePackage(pkg)
        nav('/camara')
      })
      .catch(() => {
        if (!cancelled) nav('/paquetes')
      })
    return () => {
      cancelled = true
      signal.current.aborted = true
    }
    // pendingLevel is the only download input
  }, [session.pendingLevel])

  const pct = Math.round((progress.loaded / progress.total) * 100)

  return (
    <main className="screen stack">
      <h1>Descargando guía local</h1>
      <div className="progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} role="progressbar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <p>{progress.paused ? 'Pausado' : `${pct}%`}</p>
      <button
        className="btn ghost"
        type="button"
        onClick={() => {
          signal.current.paused = !signal.current.paused
        }}
      >
        {progress.paused ? 'Reanudar' : 'Pausar'}
      </button>
    </main>
  )
}
