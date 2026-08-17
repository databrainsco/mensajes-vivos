import { Link } from 'react-router-dom'
import { speak } from '../audio/SoundPlayer'
import { useSession } from '../app/session'
import { PIECES } from '../demo/packageData'
import { saveDiscovery } from '../packages/db'
import { cardForVision } from './AnalysisScreen'
import type { PieceCard, VerificationState } from '../types'

const STATE_COPY: Record<VerificationState, string> = {
  confirmada_por_paquete: 'Confirmada por ficha local',
  identificacion_probable: 'Identificación probable',
  descripcion_visual: 'Solo descripción visual',
}

function narrationFor(card: PieceCard) {
  return card.texto_narracion
}

export function ResultScreen() {
  const session = useSession()
  const vision = session.vision
  const pieces = session.activePackage?.pieces ?? PIECES
  const card = cardForVision(vision?.identificacion.nombre ?? null, pieces)
  const hasAnimals = Boolean(card && card.animales.length > 0)
  const hasInstruments = Boolean(card && card.instrumentos.length > 0)
  const hasSound = hasAnimals || hasInstruments

  if (!vision) {
    return (
      <main className="screen stack">
        <p>No hay análisis.</p>
        <Link className="btn ghost row" to="/camara">Volver a la cámara</Link>
      </main>
    )
  }

  if (!card) {
    return (
      <main className="screen stack">
        <p className="kicker">Resultado</p>
        <h1>Pieza no identificada</h1>
        <p>No hay ficha concreta todavía. No se abre una pieza de catálogo al azar.</p>
        <p>{vision.descripcion_visible}</p>
        <Link className="btn primary row" to="/camara">Seguir explorando</Link>
      </main>
    )
  }

  return (
    <main className="screen stack">
      <p className="kicker">{card.sala}</p>
      <h1>{card.nombre}</h1>
      {card.nombre_alternativo && <p className="meta">{card.nombre_alternativo}</p>}
      {session.capture && (
        <img className="preview" src={session.capture} alt={`Vista de ${card.nombre}`} />
      )}

      <p className="meta">
        {card.cultura} · {card.periodo} · {card.tipo_objeto}
        {card.inventario ? ` · Inv. ${card.inventario}` : ''}
      </p>
      <p className="meta">{STATE_COPY[vision.identificacion.estado]} · {Math.round(vision.identificacion.confianza * 100)}%</p>

      <section className="card">
        <h2>Sobre la pieza</h2>
        <p>{card.resumen}</p>
      </section>

      {card.elementos.length > 0 && (
        <section className="card">
          <h2>Elementos visibles</h2>
          <ul>
            {card.elementos.map((e) => (
              <li key={e.nombre}>{e.nombre}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2>Lugares</h2>
        <p><strong>Resguardo:</strong> {card.lugares.resguardo.etiqueta}</p>
        <p><strong>Hallazgo:</strong> {card.lugares.hallazgo.etiqueta}</p>
        {card.lugares.hallazgo.nota && <p className="meta">{card.lugares.hallazgo.nota}</p>}
        {card.lugares.elaboracion && (
          <p><strong>Elaboración:</strong> {card.lugares.elaboracion.etiqueta}</p>
        )}
      </section>

      {card.simbolos.length > 0 && (
        <section className="card">
          <h2>Símbolos</h2>
          {card.simbolos.slice(0, 2).map((s) => (
            <div key={s.id}>
              <strong>{s.titulo}</strong>
              <p>{s.texto}</p>
            </div>
          ))}
          <Link to="/simbolos">Ver todos los símbolos</Link>
        </section>
      )}

      <div className="stack">
        <button className="btn primary row" type="button" onClick={() => speak(narrationFor(card))}>
          Escuchar historia
        </button>
        <Link className="btn secondary row" to="/simbolos">Explorar símbolos</Link>
        <Link className="btn ghost row" to="/mapa">Ver mapa</Link>
        {hasSound && (
          <Link className="btn ghost row" to="/sonido">
            {hasAnimals && hasInstruments
              ? 'Animales e instrumentos'
              : hasAnimals
                ? 'Escuchar animal'
                : 'Escuchar instrumento'}
          </Link>
        )}
        <details>
          <summary>Fuentes</summary>
          <ul>
            {card.fuentes.map((f) => (
              <li key={f.titulo}>{f.titulo} — {f.procedencia}</li>
            ))}
          </ul>
        </details>
        <button
          className="btn ghost row"
          type="button"
          onClick={() => {
            const item = {
              id: crypto.randomUUID(),
              savedAt: new Date().toISOString(),
              pieceId: card.id,
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
        <Link className="btn ghost row" to="/camara">No es correcto</Link>
      </div>
    </main>
  )
}
