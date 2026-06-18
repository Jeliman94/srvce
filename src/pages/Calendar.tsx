import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { orderPriorityColors } from '../lib/labels'

const WEEKDAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

export default function CalendarPage() {
  const { orders, customerName, loading } = useEntities()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const todayKey = dateKey(new Date())

  const cells = useMemo(() => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const firstWeekday = mondayIndex(new Date(year, monthIndex, 1))
    const result: (Date | null)[] = []
    for (let i = 0; i < firstWeekday; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(new Date(year, monthIndex, d))
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [month])

  const ordersByDate = useMemo(() => {
    const map = new Map<string, typeof orders>()
    for (const o of orders) {
      if (!o.scheduledAt) continue
      const key = dateKey(new Date(o.scheduledAt))
      map.set(key, [...(map.get(key) ?? []), o])
    }
    return map
  }, [orders])

  if (loading) return <p className="text-sm text-slate-400">Načítání…</p>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Kalendář zásahů</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            ← Předchozí
          </Button>
          <span className="text-sm font-medium text-slate-700">
            {month.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
          </span>
          <Button
            variant="secondary"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            Další →
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((w) => (
            <div key={w} className="pb-1 text-center text-xs font-medium text-slate-400">
              {w}
            </div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={i} />
            const key = dateKey(date)
            const dayOrders = ordersByDate.get(key) ?? []
            const isToday = key === todayKey
            return (
              <div
                key={i}
                className={`min-h-24 rounded-md border p-1.5 text-xs ${
                  isToday ? 'border-slate-400 bg-slate-50' : 'border-slate-100'
                }`}
              >
                <p className={`mb-1 font-medium ${isToday ? 'text-slate-900' : 'text-slate-400'}`}>
                  {date.getDate()}
                </p>
                <div className="space-y-1">
                  {dayOrders.map((o) => (
                    <Link
                      key={o.id}
                      to={`/zakazky/${o.id}`}
                      className={`block truncate rounded px-1.5 py-0.5 ring-1 ring-inset ${orderPriorityColors[o.priority]}`}
                      title={`${o.number} – ${customerName(o.customerId)}`}
                    >
                      {o.number}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
