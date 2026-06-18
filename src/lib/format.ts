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
