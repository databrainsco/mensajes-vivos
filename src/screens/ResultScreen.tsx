import { Link } from 'react-router-dom'
import { speak } from '../audio/SoundPlayer'
import { useSession } from '../app/session'
import { PIECES } from '../demo/packageData'
import { saveDiscovery } from '../packages/db'
import { cardForVision } from './AnalysisScreen'

import type { VerificationState, VisualElement } from '../types'

const STATE_COPY: Record<VerificationState, string> = {
  confirmada_por_paquete: 'Confirmada por paquete local',
  identificacion_probable: 'Identificación probable',
  descripcion_visual: 'Descripción visual',
}

export function ResultScreen() {
  const session = useSession()
  const vision = session.vision
  const pieces = session.activePackage?.pieces ?? PIECES
  const card = cardForVision(vision?.identificacion.nombre ?? null, pieces)

  if (!vision) {
    return (
      <main className="screen">
        <p>No hay análisis.</p>
        <Link to="/camara">Volver</Link>
      </main>
    )
  }

  const headline =
    vision.identificacion.estado === 'confirmada_por_paquete' && card
      ? `${card.nombre}. Coincidencia alta con la ficha de la ${card.sala}.`
      : vision.identificacion.estado === 'identificacion_probable'
        ? `Posible representación de ${vision.identificacion.nombre}. No se encontró una ficha local suficiente para confirmarlo.`
        : vision.descripcion_visible

  return (
    <main className="screen stack">
      <p className="badge">Demostración con datos precargados</p>
      <h1>{card?.nombre ?? 'Sin identidad inventada'}</h1>
      {card?.nombre_alternativo && <p className="meta">{card.nombre_alternativo}</p>}
      {session.capture && <img className="preview" src={session.capture} alt="Captura temporal, no almacenada aún" />}
      <p>{headline}</p>
      <p className="meta">
        Confianza: {Math.round(vision.identificacion.confianza * 100)}% · {STATE_COPY[vision.identificacion.estado]}
      </p>
      {card && (
        <>
          <p>{card.cultura} · {card.periodo} · {card.tipo_objeto}</p>
          <p>{card.resumen}</p>
        </>
      )}
      <ul>
        {vision.elementos.map((e: VisualElement) => (
          <li key={e.nombre}>{e.tipo}: {e.nombre} ({Math.round(e.confianza * 100)}%)</li>
        ))}
      </ul>
      {card?.lugares.hallazgo && <p>Hallazgo: {card.lugares.hallazgo.etiqueta}</p>}
      {session.coords && <p>Ubicación actual: {session.coords.lat.toFixed(4)}, {session.coords.lng.toFixed(4)}</p>}
      <div className="stack">
        <button className="btn primary" type="button" onClick={() => speak(card?.resumen ?? vision.descripcion_visible)}>
          Escuchar historia
        </button>
        <Link className="btn secondary row" to="/simbolos">Explorar símbolos</Link>
        <Link className="btn ghost row" to="/mapa">Ver lugar del hallazgo / mapa</Link>
        <Link className="btn ghost row" to="/sonido">Animales e instrumentos</Link>
        {card && (
          <details>
            <summary>Consultar fuentes</summary>
            <ul>
              {card.fuentes.map((f) => (
                <li key={f.titulo}>{f.titulo} — {f.procedencia}</li>
              ))}
            </ul>
          </details>
        )}
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            const item = {
              id: crypto.randomUUID(),
              savedAt: new Date().toISOString(),
              pieceId: card?.id,
              vision,
              captureDataUrl: session.capture ?? undefined,
            }
            session.setLastDiscovery(item)
            void saveDiscovery(item)
          }}
        >
          Guardar descubrimiento
        </button>
        <Link className="btn ghost row" to="/camara">Seguir explorando</Link>
        <p className="meta">Si no es correcto, vuelve a la cámara. No se inventará otra identidad.</p>
        <Link className="btn ghost row" to="/camara">No es correcto</Link>
      </div>
    </main>
  )
}
