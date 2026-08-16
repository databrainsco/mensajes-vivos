import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, VisionResult } from '../types'
import { PIECES } from '../demo/packageData'

function hashPixels(width: number, height: number): number[] {
  const seed = (width * 13 + height * 7) % 1000
  return [
    (seed % 17) / 17,
    ((seed * 3) % 19) / 19,
    ((seed * 5) % 23) / 23,
    ((seed * 7) % 29) / 29,
    ((seed * 11) % 31) / 31,
    ((seed * 13) % 37) / 37,
    ((seed * 17) % 41) / 41,
    ((seed * 19) % 43) / 43,
  ]
}

function pickDemo(context?: AnalyzeContext): (typeof PIECES)[number] | null {
  const blob = (context?.indoorCues ?? []).join(' ').toLowerCase()
  if (blob.includes('coatlicue') || blob.includes('serpiente')) return PIECES[0]
  if (blob.includes('jaguar') || blob.includes('ocelot') || blob.includes('cuauh')) return PIECES[1]
  if (blob.includes('xolot') || blob.includes('codice') || blob.includes('fejervary')) return PIECES[2]
  return null
}

/**
 * Adaptador de demostración. Nunca debe presentarse como un modelo real.
 * Sustituye esta clase implementando LocalVisionModel con WebGPU/WASM.
 */
export class DemoLocalVisionModel implements LocalVisionModel {
  private loaded = false
  readonly kind = 'simulation' as const

  async loadModel() {
    await new Promise((r) => setTimeout(r, 400))
    this.loaded = true
  }

  async getDeviceCapabilities(): Promise<DeviceCapabilities> {
    const webgpu = typeof navigator !== 'undefined' && 'gpu' in navigator
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    return {
      webgpu,
      wasm: typeof WebAssembly !== 'undefined',
      recommendedModel: memory && memory <= 4 ? 'small' : 'full',
      memoryHintMb: memory ? memory * 1024 : null,
    }
  }

  async generateEmbedding(image: ImageBitmap | ImageData | HTMLCanvasElement): Promise<number[]> {
    const w = 'width' in image ? image.width : 64
    const h = 'height' in image ? image.height : 64
    return hashPixels(w, h)
  }

  async analyzeImage(
    image: ImageBitmap | ImageData | HTMLCanvasElement,
    context?: AnalyzeContext,
  ): Promise<VisionResult> {
    if (!this.loaded) await this.loadModel()
    const demo = pickDemo(context)
    const embedding = demo?.embedding ?? (await this.generateEmbedding(image))

    if (!demo) {
      return {
        tipo_objeto: 'objeto_desconocido',
        identificacion: { nombre: null, confianza: 0.34, estado: 'descripcion_visual' },
        cultura: null,
        periodo: null,
        elementos: [{ tipo: 'figura', nombre: 'figura antropomorfa con elementos de ave', confianza: 0.55 }],
        instrumentos: [],
        alternativas: [],
        advertencias: [
          'Simulación local. No es un resultado de un modelo multimodal real.',
          'Figura antropomorfa con elementos de ave. No puedo identificar una pieza específica.',
        ],
        descripcion_visible: 'Figura antropomorfa con elementos de ave. No puedo identificar una pieza específica.',
        embedding,
        simulation: true,
      }
    }

    const indoor =
      demo.id === 'coatlicue'
        ? { museo: 'Museo Nacional de Antropología', sala: 'Sala Mexica', inventario: demo.inventario }
        : { museo: 'Museo Nacional de Antropología', sala: demo.sala }

    return {
      tipo_objeto: demo.tipo_objeto,
      identificacion: {
        nombre: demo.nombre,
        confianza: demo.id === 'xolotl-fejervary' ? 0.71 : 0.94,
        estado: demo.id === 'xolotl-fejervary' ? 'identificacion_probable' : 'confirmada_por_paquete',
      },
      cultura: null,
      periodo: null,
      elementos: demo.elementos,
      instrumentos: [],
      alternativas: demo.id === 'xolotl-fejervary' ? [{ nombre: 'Deidad con rasgos caninos no identificada', confianza: 0.4 }] : [],
      advertencias: [
        'Simulación local. Demostración con datos precargados.',
        ...(demo.id === 'xolotl-fejervary'
          ? ['Posible representación de Xólotl. No se encontró una ficha local suficiente para confirmarlo con certeza máxima.']
          : []),
      ],
      descripcion_visible:
        demo.id === 'coatlicue'
          ? 'Escultura antropomorfa monumental con serpientes y collar de elementos orgánicos.'
          : demo.id === 'ocelotl-cuauhxicalli'
            ? 'Escultura zoomorfa de felino recostado, superficie labrada.'
            : 'Pintura de códice con figura de rasgos caninos; no se observan instrumentos musicales.',
      indoor_cues: indoor,
      embedding,
      simulation: true,
    }
  }

  async releaseResources() {
    this.loaded = false
  }
}

let singleton: DemoLocalVisionModel | null = null

export function getLocalVisionModel(): LocalVisionModel {
  if (!singleton) singleton = new DemoLocalVisionModel()
  return singleton
}
