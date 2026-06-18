// Mock backend: persists rows in localStorage behind an async API shaped like a
// real backend client (e.g. Supabase), so swapping the storage layer later
// doesn't require touching any calling code.

const LATENCY_MS = 120

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))
}

export class LocalTable<T extends { id: string }> {
  private key: string

  constructor(key: string, seed: T[]) {
    this.key = `srvce:${key}`
    if (localStorage.getItem(this.key) === null) {
      localStorage.setItem(this.key, JSON.stringify(seed))
    }
  }

  private read(): T[] {
    return JSON.parse(localStorage.getItem(this.key) ?? '[]') as T[]
  }

  private write(rows: T[]) {
    localStorage.setItem(this.key, JSON.stringify(rows))
  }

  async list(): Promise<T[]> {
    return delay(this.read())
  }

  async get(id: string): Promise<T | undefined> {
    return delay(this.read().find((row) => row.id === id))
  }

  async insert(row: T): Promise<T> {
    const rows = this.read()
    rows.push(row)
    this.write(rows)
    return delay(row)
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    const rows = this.read()
    const index = rows.findIndex((row) => row.id === id)
    if (index === -1) throw new Error(`Záznam ${id} nenalezen`)
    rows[index] = { ...rows[index], ...patch }
    this.write(rows)
    return delay(rows[index])
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((row) => row.id !== id))
    return delay(undefined)
  }

  reset(seed: T[]) {
    this.write(seed)
  }
}
