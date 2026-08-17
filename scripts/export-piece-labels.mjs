import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'src/demo/packageData.ts'), 'utf8')
const photos = JSON.parse(readFileSync(join(root, 'src/demo/museumPhotos.json'), 'utf8'))
const ids = new Set(photos.map((p) => p.pieceId))
const labels = []

for (const block of src.split(/\n\s*id:\s*'/)) {
  const idEnd = block.indexOf("'")
  if (idEnd < 0) continue
  const id = block.slice(0, idEnd)
  if (!ids.has(id)) continue
  const clipMatch = block.match(/clip_label:\s*'([^']+)'/)
  if (!clipMatch) {
    console.warn('sin clip_label', id)
    continue
  }
  labels.push({ pieceId: id, clip_label: clipMatch[1] })
}

const missing = [...ids].filter((id) => !labels.some((l) => l.pieceId === id))
if (missing.length) {
  console.warn('faltan', missing.join(', '))
  process.exitCode = 1
}

const dest = join(root, 'src/demo/pieceLabels.json')
writeFileSync(dest, `${JSON.stringify(labels, null, 2)}\n`)
console.log('escrito', dest, labels.length)
