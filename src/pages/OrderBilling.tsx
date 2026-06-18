import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { Card } from '../components/ui/Card'
import { formatDurationMinutes, formatMoney, workDurationMinutes } from '../lib/format'
import { getRoundTrip, type RoundTrip } from '../lib/travel'
import {
  billedKm,
  billedLaborMinutes,
  getPricingSettings,
  laborPrice,
  travelPrice,
} from '../lib/pricing'

export default function OrderBilling() {
  const { id } = useParams<{ id: string }>()
  const { orders, customers, loading, customerName } = useEntities()
  const [trip, setTrip] = useState<RoundTrip | null | undefined>(undefined)

  const found = orders.find((o) => o.id === id)
  const customer = found ? customers.find((c) => c.id === found.customerId) : undefined

  useEffect(() => {
    if (!customer) return
    let cancelled = false
    getRoundTrip(`${customer.street}, ${customer.city}`).then((result) => {
      if (!cancelled) setTrip(result)
    })
    return () => {
      cancelled = true
    }
  }, [customer])

  if (loading) return <p className="text-sm text-slate-400">Načítání…</p>
  if (!found) return <p className="text-sm text-slate-500">Zakázka nenalezena.</p>
  const order = found

  const settings = getPricingSettings()
  const workMinutes = workDurationMinutes(order.workStartedAt, order.workEndedAt)
  const billedMinutes = workMinutes != null ? billedLaborMinutes(workMinutes) : null
  const work = workMinutes != null ? laborPrice(workMinutes, customer?.type ?? 'osoba', settings) : null
  const travel = trip ? travelPrice(trip.km, settings) : null
  const total = work != null || travel != null ? (work ?? 0) + (travel ?? 0) : null

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/zakazky/${order.id}`} className="text-sm text-slate-400 hover:underline">
          ← {order.number}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Vyúčtování</h1>
        <p className="text-sm text-slate-500">{customerName(order.customerId)}</p>
      </div>

      <Card className="max-w-xl p-5">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Odpracovaný čas</td>
              <td className="py-2 text-right">{formatDurationMinutes(workMinutes)}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Účtovaný čas</td>
              <td className="py-2 text-right">{formatDurationMinutes(billedMinutes)}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Cena za práci</td>
              <td className="py-2 text-right">{work != null ? formatMoney(work) : '—'}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Vzdálenost (tam i zpět)</td>
              <td className="py-2 text-right">
                {trip === undefined ? 'Počítání…' : trip ? `${trip.km} km` : '—'}
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Účtované km</td>
              <td className="py-2 text-right">{trip ? `${billedKm(trip.km)} km` : '—'}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Cena za dopravu</td>
              <td className="py-2 text-right">{travel != null ? formatMoney(travel) : '—'}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold text-slate-900">Celkem (bez DPH)</td>
              <td className="py-2 text-right font-semibold text-slate-900">
                {total != null ? formatMoney(total) : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Link to="/zakazky" className="text-sm text-slate-500 hover:underline">
        ← Zpět na zakázky
      </Link>
    </div>
  )
}
