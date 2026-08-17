import { Link } from 'react-router-dom'
import { useState } from 'react'
import { speak } from '../audio/SoundPlayer'
import { useSession } from '../app/session'
import { PIECES } from '../demo/packageData'
import { saveDiscovery } from '../packages/db'
import { cardForVision } from './AnalysisScreen'
import { HistoricalMap } from '../maps/HistoricalMap'
import type { GeoPlace, LocationKind, VerificationState } from '../types'

const STATE_COPY: Record<VerificationState, string> = {
  confirmada_por_paquete: 'Confirmada por ficha local',
  identificacion_probable: 'Identificación probable',
  descripcion_visual: 'Solo descripción visual',
}

function certezaCopy(c: GeoPlace['certeza']) {
  if (c === 'exacta') return 'Punto documentado'
  if (c === 'aproximada') return 'Región aproximada'
  if (c === 'propuestas_multiples') return 'Varias propuestas'
  return 'No confirmado'
}

function PlaceBlock({
  title,
  place,
  kind,
  active,
  onSelect,
}: {
  title: string
  place: GeoPlace
  kind: LocationKind
  active: boolean
  onSelect: (kind: LocationKind) => void
}) {
  const hasPoint = Boolean(place.coordinates)
  return (
    <button
      type="button"
      className={`place-block ${active ? 'active' : ''} ${hasPoint ? '' : 'disabled'}`}
      disabled={!hasPoint}
      onClick={() => {
        if (!hasPoint) return
        onSelect(kind)
        document.getElementById('ficha-mapa')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }}
    >
      <p className="meta">
        {title} · {certezaCopy(place.certeza)}
        {hasPoint ? ' · Toca para ver en el mapa' : ' · Sin punto en el mapa'}
      </p>
      <p>
        <strong>{place.etiqueta}</strong>
      </p>
      {place.nota && <p>{place.nota}</p>}
    </button>
  )
}

export function ResultScreen() {
  const session = useSession()
  const vision = session.vision
  const pieces = session.activePackage?.pieces ?? PIECES
  const card = cardForVision(vision?.identificacion.nombre ?? null, pieces)
  const hasAnimals = Boolean(card && card.animales.length > 0)
  const hasInstruments = Boolean(card && card.instrumentos.length > 0)
  const hasSound = hasAnimals || hasInstruments
  const [focusKind, setFocusKind] = useState<LocationKind | null>(null)

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

  const places = [
    { kind: 'resguardo' as const, place: card.lugares.resguardo },
    { kind: 'hallazgo' as const, place: card.lugares.hallazgo },
    ...(card.lugares.elaboracion ? [{ kind: 'elaboracion' as const, place: card.lugares.elaboracion }] : []),
  ]

  return (
    <main className="screen stack">
      <p className="kicker">{card.sala}</p>
      <h1>{card.nombre}</h1>
      {card.nombre_alternativo && <p className="meta">{card.nombre_alternativo}</p>}
      {session.capture && (
        <img className="preview" src={session.capture} alt={`Vista de ${card.nombre}`} />
      )}

      <p className="meta">
        {card.cultura} · {card.periodo} · {card.tipo_objeto.replace('_', ' ')}
        {card.inventario ? ` · Inv. ${card.inventario}` : ''}
      </p>
      <p className="meta">{STATE_COPY[vision.identificacion.estado]} · {Math.round(vision.identificacion.confianza * 100)}%</p>

      <section className="card">
        <h2>Historia</h2>
        <p>{card.historia}</p>
        <button className="btn primary row" type="button" onClick={() => speak(card.texto_narracion)}>
          Escuchar relato
        </button>
      </section>

      <section className="card">
        <h2>Lugares</h2>
        <p className="meta">Toca un lugar de la lista o un punto del mapa para ver su ubicación.</p>
        <HistoricalMap
          compact
          focusKind={focusKind}
          user={session.coords ? { lng: session.coords.lng, lat: session.coords.lat } : null}
          places={places}
        />
        <PlaceBlock
          title="Dónde se resguarda"
          place={card.lugares.resguardo}
          kind="resguardo"
          active={focusKind === 'resguardo'}
          onSelect={setFocusKind}
        />
        <PlaceBlock
          title="Dónde se encontró"
          place={card.lugares.hallazgo}
          kind="hallazgo"
          active={focusKind === 'hallazgo'}
          onSelect={setFocusKind}
        />
        {card.lugares.elaboracion && (
          <PlaceBlock
            title="Dónde se elaboró"
            place={card.lugares.elaboracion}
            kind="elaboracion"
            active={focusKind === 'elaboracion'}
            onSelect={setFocusKind}
          />
        )}
        <Link className="btn secondary row" to="/mapa">Abrir mapa amplio</Link>
      </section>

      <section className="card">
        <h2>Datos curiosos</h2>
        <ul>
          {card.curiosidades.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      {card.elementos.length > 0 && (
        <section className="card">
          <h2>Qué se ve</h2>
          <ul>
            {card.elementos.map((e) => (
              <li key={e.nombre}>{e.nombre}</li>
            ))}
          </ul>
        </section>
      )}

      {card.simbolos.length > 0 && (
        <section className="card">
          <h2>Símbolos y lectura</h2>
          {card.simbolos.map((s) => (
            <div key={s.id}>
              <strong>{s.titulo}</strong>
              <p>{s.texto}</p>
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <h2>Más información</h2>
        <p className="meta">Enlaces de museos y acervos. Se abren fuera de la app.</p>
        <ul className="link-list">
          {card.enlaces.map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.titulo}
              </a>
              {l.nota ? <span className="meta"> — {l.nota}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Fuentes</h2>
        <ul className="link-list">
          {card.fuentes.map((f) => (
            <li key={f.titulo}>
              {f.url ? (
                <a href={f.url} target="_blank" rel="noreferrer">{f.titulo}</a>
              ) : (
                <strong>{f.titulo}</strong>
              )}
              <span className="meta"> — {f.procedencia}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="stack">
        {hasSound && (
          <Link className="btn ghost row" to="/sonido">
            {hasAnimals && hasInstruments
              ? 'Animales e instrumentos'
              : hasAnimals
                ? 'Escuchar animal'
                : 'Escuchar instrumento'}
          </Link>
        )}
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
