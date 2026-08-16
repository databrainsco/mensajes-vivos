export {}

declare global {
  namespace GeoJSON {
    type Position = number[]
    interface Polygon {
      type: 'Polygon'
      coordinates: Position[][]
    }
    interface MultiPolygon {
      type: 'MultiPolygon'
      coordinates: Position[][][]
    }
    interface Point {
      type: 'Point'
      coordinates: Position
    }
    interface Feature<G = Polygon | Point | MultiPolygon> {
      type: 'Feature'
      geometry: G
      properties: Record<string, unknown>
    }
    interface FeatureCollection {
      type: 'FeatureCollection'
      features: Feature[]
    }
  }
}
