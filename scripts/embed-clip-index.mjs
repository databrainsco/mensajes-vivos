import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const photos = JSON.parse(await readFile(join(root, 'src/demo/museumPhotos.json'), 'utf8'))
const pieceLabels = JSON.parse(await readFile(join(root, 'src/demo/pieceLabels.json'), 'utf8'))
const hfId = 'Xenova/clip-vit-base-patch32'

function l2(values) {
  let n = 0
  for (const x of values) n += x * x
  n = Math.sqrt(n) || 1
  return values.map((x) => Math.round((x / n) * 1e5) / 1e5)
}

function vec(tensor) {
  return l2(Array.from(tensor.data).slice(0, tensor.dims.at(-1)))
}

/** Misma escala que la cámara (lado mayor ≤ 256). */
async function fitCamera(image) {
  const max = 256
  const scale = Math.min(1, max / Math.max(image.width, image.height))
  if (scale >= 0.999) return image
  return image.resize(Math.max(1, Math.round(image.width * scale)), Math.max(1, Math.round(image.height * scale)))
}

/** Recorte alto (cara / torso), para estatuas verticales. */
async function upperSquare(image) {
  const side = Math.min(image.width, image.height)
  if (side < 32) return null
  const left = Math.floor((image.width - side) / 2)
  const top = Math.floor(Math.max(0, (image.height - side) * 0.12))
  return image.crop([left, top, side, side])
}

console.log('Cargando CLIP (visión + texto)…')
const { AutoProcessor, AutoTokenizer, CLIPVisionModelWithProjection, CLIPTextModelWithProjection, RawImage, env } =
  await import('@huggingface/transformers')
env.allowLocalModels = false
env.useBrowserCache = false
try {
  if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.proxy = false
} catch {
  // ignore
}

const [processor, tokenizer, vision, textModel] = await Promise.all([
  AutoProcessor.from_pretrained(hfId),
  AutoTokenizer.from_pretrained(hfId),
  CLIPVisionModelWithProjection.from_pretrained(hfId, { dtype: 'q8' }),
  CLIPTextModelWithProjection.from_pretrained(hfId, { dtype: 'q8' }),
])

async function embedImage(image, pieceId, file, view) {
  const inputs = await processor(await fitCamera(image))
  const { image_embeds } = await vision(inputs)
  return { pieceId, file, view, embedding: vec(image_embeds) }
}

const photoEntries = []
for (const photo of photos) {
  const path = join(root, 'public/packages/mna-sala-mexica/images/index', photo.file)
  const image = await RawImage.read(path)
  photoEntries.push(await embedImage(image, photo.pieceId, photo.file, 'full'))
  const crop = await upperSquare(image)
  if (crop) {
    photoEntries.push(await embedImage(crop, photo.pieceId, photo.file, 'upper'))
  }
  console.log('foto', photo.pieceId, photo.file)
}

const textSpecs = [
  { id: 'artifact', kind: 'artifact', text: 'a photo of a pre-Hispanic Mexican museum sculpture artifact or archaeological monument' },
  { id: 'reject:book', kind: 'reject', text: 'a photo of a modern printed book cover or textbook' },
  { id: 'reject:screen', kind: 'reject', text: 'a photo of a laptop computer or phone screen displaying a website' },
  { id: 'reject:object', kind: 'reject', text: 'a photo of an unrelated everyday modern object' },
  { id: 'reject:selfie', kind: 'reject', text: 'a photo of a person selfie or contemporary portrait photo' },
  { id: 'reject:empty', kind: 'reject', text: 'a photo of a blurry dark empty scene with no artifact' },
  { id: 'family:stone_statue', kind: 'family', family: 'stone_statue', text: 'a photo of a large carved stone statue of a Mexican museum deity jaguar or warrior' },
  { id: 'family:carved_disk', kind: 'family', family: 'carved_disk', text: 'a photo of a large circular carved Aztec stone disk or calendar monument' },
  { id: 'family:colossal_head', kind: 'family', family: 'colossal_head', text: 'a photo of an Olmec colossal basalt head with helmet-like headdress' },
  { id: 'family:relief', kind: 'family', family: 'relief', text: 'a photo of a carved Maya or Mexican stone relief stela or temple panel' },
  { id: 'family:mask', kind: 'family', family: 'mask', text: 'a photo of a pre-Hispanic Mexican stone or jade mosaic funerary mask' },
  { id: 'family:codex', kind: 'family', family: 'codex', text: 'a photo of a pre-Hispanic Mexican painted pictographic codex manuscript page' },
  { id: 'family:glyph', kind: 'family', family: 'glyph', text: 'a photo of a single Aztec or Maya calendar glyph symbol' },
  { id: 'family:ceramic', kind: 'family', family: 'ceramic', text: 'a photo of a pre-Hispanic Mexican clay urn vase brazier or figurine' },
  { id: 'family:instrument', kind: 'family', family: 'instrument', text: 'a photo of a pre-Hispanic Mexican wooden drum clay flute or conch trumpet' },
  { id: 'family:architecture', kind: 'family', family: 'architecture', text: 'a photo of a Mexican archaeological stepped pyramid or temple ruin' },
  ...pieceLabels.map((p) => ({
    id: `piece:${p.pieceId}`,
    kind: 'piece',
    pieceId: p.pieceId,
    text: `a photo of ${p.clip_label}`,
  })),
]

const texts = textSpecs.map((s) => s.text)
const textInputs = tokenizer(texts, { padding: true, truncation: true })
const { text_embeds } = await textModel(textInputs)
const dim = text_embeds.dims[1]
const textEntries = textSpecs.map((spec, i) => ({
  id: spec.id,
  kind: spec.kind,
  family: spec.family,
  pieceId: spec.pieceId,
  embedding: l2(Array.from(text_embeds.data).slice(i * dim, (i + 1) * dim)),
}))

const out = {
  model: hfId,
  dim: 512,
  photos: photoEntries,
  texts: textEntries,
}

const dest = join(root, 'src/demo/clipIndex.json')
await mkdir(dirname(dest), { recursive: true })
await writeFile(dest, JSON.stringify(out))
console.log('escrito', dest, 'fotos', photoEntries.length, 'textos', textEntries.length)
