import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { Card } from '../components/ui/Card'
import { formatDate, formatDurationMinutes, workDurationMinutes } from '../lib/format'
import { getRoundTrip, type RoundTrip } from '../lib/travel'
import type { OrderStatus } from '../types'

const COMPLETED_STATUSES: OrderStatus[] = ['hotovo', 'fakturovano']

export default function CompletedServices() {
  const { orders, customers, loading, customerName, technicianName } = useEntities()
  const [travel, setTravel] = useState<Record<string, RoundTrip | null>>({})

  const completed = useMemo(
    () =>
      orders
        .filter((o) => COMPLETED_STATUSES.includes(o.status))
        .sort((a, b) => (b.completedAt ?? b.workEndedAt ?? '').localeCompare(a.completedAt ?? a.workEndedAt ?? '')),
    [orders],
  )

  const travelTargets = useMemo(() => {
    const seen = new Set<string>()
    const list: { customerId: string; address: string }[] = []
    for (const order of completed) {
      const customer = customers.find((c) => c.id === order.customerId)
      if (!customer || seen.has(customer.id)) continue
      seen.add(customer.id)
      list.push({ customerId: customer.id, address: `${customer.street}, ${customer.city}` })
    }
    return list
  }, [completed, customers])

  useEffect(() => {
    let cancelled = false
    async function run() {
      for (const { customerId, address } of travelTargets) {
        if (cancelled) return
        const result = await getRoundTrip(address)
        if (cancelled) return
        setTravel((prev) => ({ ...prev, [customerId]: result }))
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [travelTargets])

  if (loading) return <p className="text-sm text-slate-400">Načítání…</p>

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Hotové servisy</h1>
        <p className="text-sm text-slate-500">
          Odpracované hodiny dle zapsaného času příjezdu a odjezdu, doplněné o čas cesty
          (tam i zpět z adresy K Chaloupkám 92, Stěžery).
        </p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
              <th className="px-4 py-3">Zakázka</th>
              <th className="px-4 py-3">Zákazník</th>
              <th className="px-4 py-3">Technik</th>
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3">Práce</th>
              <th className="px-4 py-3">Cesta</th>
              <th className="px-4 py-3">Km</th>
              <th className="px-4 py-3">Celkem</th>
            </tr>
          </thead>
          <tbody>
            {completed.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-sm text-slate-400">
                  Žádné hotové servisy.
                </td>
              </tr>
            )}
            {completed.map((order) => {
              const customer = customers.find((c) => c.id === order.customerId)
              const workMinutes = workDurationMinutes(order.workStartedAt, order.workEndedAt)
              const trip = customer ? travel[customer.id] : undefined
              const total =
                workMinutes != null || trip != null ? (workMinutes ?? 0) + (trip?.minutes ?? 0) : null
              return (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <Link to={`/zakazky/${order.id}`} className="font-medium text-slate-900 hover:underline">
                      {order.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{customerName(order.customerId)}</td>
                  <td className="px-4 py-3 text-slate-700">{technicianName(order.assignedTechnicianId)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(order.completedAt ?? order.workEndedAt ?? order.scheduledAt)}
                  </td>
                  <td className="px-4 py-3">{formatDurationMinutes(workMinutes)}</td>
                  <td className="px-4 py-3">
                    {trip === undefined && customer ? 'Počítání…' : formatDurationMinutes(trip?.minutes)}
                  </td>
                  <td className="px-4 py-3">{trip ? `${trip.km} km` : '—'}</td>
                  <td className="px-4 py-3 font-medium">{formatDurationMinutes(total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
