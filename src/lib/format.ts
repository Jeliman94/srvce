export function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('cs-CZ')
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function toDatetimeInputValue(iso?: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localTime.toISOString().slice(0, 16)
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('cs-CZ', { maximumFractionDigits: 0 }) + ' Kč'
}

export function workDurationMinutes(start?: string, end?: string): number | null {
  if (!start || !end) return null
  const minutes = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  return minutes >= 0 ? minutes : null
}

export function formatDurationMinutes(minutes?: number | null): string {
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}
