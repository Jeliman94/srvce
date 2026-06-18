// Round-trip travel time from the company base to a customer address, used in
// the "Hotové servisy" report to add travel time to logged work hours.
// Uses free public OSM services (no API key) - Nominatim for geocoding and the
// OSRM demo server for routing - so results depend on those services being
// reachable; callers should treat a null result as "could not be calculated".

const COMPANY_ADDRESS = 'K Chaloupkám 92, 503 21 Stěžery, Česko'

interface Coords {
  lat: number
  lon: number
}

function cacheKey(prefix: string, value: string): string {
  return `srvce:${prefix}:${value.trim().toLowerCase()}`
}

async function geocode(address: string): Promise<Coords | null> {
  const key = cacheKey('geocode', address)
  const cached = localStorage.getItem(key)
  if (cached) return JSON.parse(cached) as Coords

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const results = (await res.json()) as { lat: string; lon: string }[]
  const first = results[0]
  if (!first) return null

  const coords: Coords = { lat: Number(first.lat), lon: Number(first.lon) }
  localStorage.setItem(key, JSON.stringify(coords))
  return coords
}

export async function getRoundTripMinutes(customerAddress: string): Promise<number | null> {
  const key = cacheKey('traveltime', customerAddress)
  const cached = localStorage.getItem(key)
  if (cached) return Number(cached)

  const company = await geocode(COMPANY_ADDRESS)
  const customer = await geocode(customerAddress)
  if (!company || !customer) return null

  const coords = `${company.lon},${company.lat};${customer.lon},${customer.lat};${company.lon},${company.lat}`
  const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`)
  if (!res.ok) return null
  const data = (await res.json()) as { routes?: { duration: number }[] }
  const durationSeconds = data.routes?.[0]?.duration
  if (typeof durationSeconds !== 'number') return null

  const minutes = Math.round(durationSeconds / 60)
  localStorage.setItem(key, String(minutes))
  return minutes
}
