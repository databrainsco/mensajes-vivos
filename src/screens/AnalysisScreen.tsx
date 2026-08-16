import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../app/session'
import { mergeWithCard, retrieveCandidates } from '../packages/catalog'
import { PIECES } from '../demo/packageData'
import { VisionClient } from '../vision/client'
import type { PieceCard } from '../types'

export function AnalysisScreen() {
  const nav = useNavigate()
  const loc = useLocation()
  const session = useSession()

  useEffect(() => {
    const state = loc.state as { cues?: string[]; width?: number; height?: number } | null
    const client = new VisionClient()
    let cancelled = false
    void (async () => {
      await client.load()
      const vision = await client.analyze({
        indoorCues: state?.cues ?? ['coatlicue'],
        packageId: session.activePackage?.id,
        width: state?.width ?? 320,
        height: state?.height ?? 240,
      })
      const pieces = session.activePackage?.pieces ?? PIECES
      const hits = retrieveCandidates(pieces, vision.embedding)
      const best = hits[0]
      if (vision.identificacion.estado !== 'identificacion_probable') {
        const merged = mergeWithCard(vision.identificacion.nombre, best?.score ?? 0, best?.piece)
        vision.identificacion.nombre = merged.nombre
        vision.identificacion.estado = merged.estado
      }
      if (vision.identificacion.estado === 'confirmada_por_paquete' && session.privacy.vibrateOnMatch) {
        navigator.vibrate?.(40)
      }
      if (!cancelled) {
        session.setVision(vision)
        nav('/resultado')
      }
      await client.release()
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="screen stack">
      <p className="badge">Simulación local</p>
      <h1>Análisis en este dispositivo</h1>
      <p>No se envían imágenes. Un solo análisis a la vez.</p>
      <div className="progress"><span style={{ width: '55%' }} /></div>
    </main>
  )
}

export function cardForVision(nombre: string | null, pieces: PieceCard[]) {
  if (!nombre) return undefined
  return pieces.find((p) => p.nombre === nombre)
}
