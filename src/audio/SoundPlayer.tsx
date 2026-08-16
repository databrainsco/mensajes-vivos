import { useEffect, useRef, useState } from 'react'
import type { SoundCategory } from '../types'

const LABELS: Record<SoundCategory, string> = {
  grabacion_original: 'Grabación de instrumento original',
  replica_arqueomusical: 'Réplica arqueomusical',
  reconstruccion_digital: 'Reconstrucción digital',
  instrumento_moderno_comparable: 'Instrumento moderno comparable',
  sonido_natural_referencia: 'Sonido natural de referencia',
  sonido_desconocido: 'Sonido desconocido',
}

export function SoundPlayer({
  src,
  title,
  captions,
  category,
  source,
  note,
}: {
  src?: string
  title: string
  captions: string
  category?: SoundCategory
  source: string
  note?: string
}) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = audio.current
    if (!el) return
    const onEnd = () => setPlaying(false)
    el.addEventListener('ended', onEnd)
    return () => el.removeEventListener('ended', onEnd)
  }, [])

  if (!src) {
    return (
      <div className="player">
        <p>No existe una grabación o reconstrucción suficientemente documentada para este instrumento.</p>
      </div>
    )
  }

  return (
    <div className="player">
      <h2>{title}</h2>
      {category && <p className="meta">{LABELS[category]}</p>}
      <p className="meta">Fuente: {source}</p>
      {note && <p>{note}</p>}
      <audio ref={audio} src={src} />
      <button
        className="btn primary"
        type="button"
        onClick={() => {
          const el = audio.current
          if (!el) return
          if (playing) {
            el.pause()
            setPlaying(false)
          } else {
            void el.play()
            setPlaying(true)
          }
        }}
      >
        {playing ? 'Pausar' : 'Reproducir'}
      </button>
      <p className="captions" aria-live="polite">{captions}</p>
    </div>
  )
}

export function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-MX'
  window.speechSynthesis.speak(u)
}
