import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function wavTone(freq, seconds, volume = 0.18) {
  const sampleRate = 22050
  const n = Math.floor(sampleRate * seconds)
  const data = Buffer.alloc(n * 2)
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate
    const env = Math.min(1, t * 12) * Math.min(1, (seconds - t) * 4)
    const sample = Math.sin(2 * Math.PI * freq * t) * volume * env
    data.writeInt16LE(Math.max(-32767, Math.min(32767, sample * 32767)), i * 2)
  }
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data])
}

const files = [
  ['public/packages/mna-sala-mexica/sounds/animals/jaguar.wav', 110, 1.4],
  ['public/packages/mna-sala-mexica/sounds/animals/xolo.wav', 180, 1.2],
  ['public/packages/mna-sala-mexica/sounds/instruments/teponaztli.wav', 90, 0.8],
  ['public/packages/mna-sala-mexica/narrations/coatlicue.wav', 220, 2.0],
  ['public/packages/mna-sala-mexica/narrations/ocelotl.wav', 200, 2.0],
  ['public/packages/mna-sala-mexica/narrations/xolotl.wav', 240, 2.0],
]

for (const [rel, freq, sec] of files) {
  const path = join(root, rel)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, wavTone(freq, sec))
}

console.log(`Wrote ${files.length} demo wav files`)
