import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const photos = JSON.parse(await readFile(join(root, 'src/demo/museumPhotos.json'), 'utf8'))
const outDir = join(root, 'public/packages/mna-sala-mexica/images/index')
const UA = 'MensajesVivos/1.5 (https://github.com/databrainsco/mensajes-vivos; educational museum index)'

async function commonsThumb(title) {
  const file = title.startsWith('File:') ? title : `File:${title}`
  const api = new URL('https://commons.wikimedia.org/w/api.php')
  api.searchParams.set('action', 'query')
  api.searchParams.set('titles', file)
  api.searchParams.set('prop', 'imageinfo')
  api.searchParams.set('iiprop', 'url|mime')
  api.searchParams.set('iiurlwidth', '420')
  api.searchParams.set('format', 'json')
  api.searchParams.set('origin', '*')
  const res = await fetch(api, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`API ${res.status} ${file}`)
  const json = await res.json()
  const pages = json?.query?.pages ?? {}
  const page = Object.values(pages)[0]
  const info = page?.imageinfo?.[0]
  const url = info?.thumburl ?? info?.url
  if (!url || page?.missing != null) throw new Error(`Sin imagen para ${file}`)
  return url
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`GET ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 1500) throw new Error(`Archivo demasiado pequeño (${buf.length} B)`)
  await writeFile(dest, buf)
  return buf.length
}

await mkdir(outDir, { recursive: true })
const ok = []
const fail = []
for (const photo of photos) {
  const dest = join(outDir, photo.file.replace(/\.svg$/i, '.jpg'))
  try {
    const url = await commonsThumb(photo.commons)
    const bytes = await download(url, dest)
    ok.push(`${photo.pieceId} · ${photo.file} (${Math.round(bytes / 1024)} KB)`)
    console.log('ok', ok.at(-1))
  } catch (error) {
    fail.push(`${photo.pieceId} · ${photo.commons}: ${error.message}`)
    console.warn('fail', fail.at(-1))
  }
}
console.log(`\nDescargadas ${ok.length}/${photos.length}. Fallidas: ${fail.length}`)
if (fail.length) console.log(fail.join('\n'))
