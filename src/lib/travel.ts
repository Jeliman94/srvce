// Round-trip travel time and distance from the company base to a customer
// address, used in the "Hotové servisy" report to add travel time to logged
// work hours. Mirrors the calculation used by the Compact-HK service
// calculator (compact-hk.cz/servis/cesty): one-way route via the Mapy.cz
// routing API, doubled for the round trip.
//
// Requires a Mapy.cz API key (https://api.mapy.cz) in VITE_MAPY_API_KEY at
// build time. Without it, or if the API is unreachable, callers get a null
// result and should treat that as "could not be calculated".

const COMPANY_ADDRESS = 'K Chaloupkám 92, 503 21 Stěžery, Česko'
const API_KEY = import.meta.env.VITE_MAPY_API_KEY as string | undefined

export interface RoundTrip {
  minutes: number
  km: number
}

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

  const url = `https://api.mapy.cz/v1/suggest?lang=cs&limit=1&type=regional.address&query=${encodeURIComponent(address)}&apikey=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as { items?: { position: { lat: number; lon: number } }[] }
  const first = data.items?.[0]
  if (!first) return null

  const coords: Coords = { lat: first.position.lat, lon: first.position.lon }
  localStorage.setItem(key, JSON.stringify(coords))
  return coords
}

async function route(from: Coords, to: Coords): Promise<{ durationSeconds: number; lengthMeters: number } | null> {
  const url = `https://api.mapy.cz/v1/routing/route?lang=cs&start=${from.lon},${from.lat}&end=${to.lon},${to.lat}&routeType=car_fast&apikey=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as { duration?: number; length?: number }
  if (typeof data.duration !== 'number' || typeof data.length !== 'number') return null
  return { durationSeconds: data.duration, lengthMeters: data.length }
}

export async function getRoundTrip(customerAddress: string): Promise<RoundTrip | null> {
  if (!API_KEY) return null

  const key = cacheKey('roundtrip', customerAddress)
  const cached = localStorage.getItem(key)
  if (cached) return JSON.parse(cached) as RoundTrip

  const company = await geocode(COMPANY_ADDRESS)
  const customer = await geocode(customerAddress)
  if (!company || !customer) return null

  const oneWay = await route(company, customer)
  if (!oneWay) return null

  const result: RoundTrip = {
    minutes: Math.round((oneWay.durationSeconds / 60) * 2),
    km: Math.round((oneWay.lengthMeters / 1000) * 2 * 10) / 10,
  }
  localStorage.setItem(key, JSON.stringify(result))
  return result
}
