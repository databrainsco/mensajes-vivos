export function pointInPolygon(lng: number, lat: number, polygon: GeoJSON.Polygon): boolean {
  const ring = polygon.coordinates[0]
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s1 = Math.sin(dLat / 2)
  const s2 = Math.sin(dLng / 2)
  const q =
    s1 * s1 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * s2 * s2
  return 2 * R * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q))
}

export function polygonCentroid(polygon: GeoJSON.Polygon): { lat: number; lng: number } {
  const ring = polygon.coordinates[0]
  let lng = 0
  let lat = 0
  const n = ring.length - 1
  for (let i = 0; i < n; i++) {
    lng += ring[i][0]
    lat += ring[i][1]
  }
  return { lng: lng / n, lat: lat / n }
}

export type GeofenceStatus = 'inside' | 'near' | 'outside'

export function classifyGeofence(
  coords: { lat: number; lng: number },
  polygon: GeoJSON.Polygon,
  nearMeters: number,
): { status: GeofenceStatus; meters: number } {
  const center = polygonCentroid(polygon)
  const meters = haversineMeters(coords, center)
  if (pointInPolygon(coords.lng, coords.lat, polygon)) {
    return { status: 'inside', meters }
  }
  if (meters <= nearMeters) return { status: 'near', meters }
  return { status: 'outside', meters }
}
