import { Link } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { Card } from '../components/ui/Card'
import { OrderPriorityBadge, OrderStatusBadge } from '../components/StatusBadge'
import { formatDateTime } from '../lib/format'
import { useAuth } from '../context/AuthContext'

const OPEN_STATUSES = ['nova', 'naplanovana', 'ceka_na_dily']

export default function Dashboard() {
  const { user } = useAuth()
  const { orders, customers, loading, customerName, technicianName } = useEntities()

  if (loading) return <p className="text-sm text-slate-400">Načítání…</p>

  const myOrders = user?.role === 'technik' ? orders.filter((o) => o.assignedTechnicianId === user.id) : orders
  const openOrders = myOrders.filter((o) => OPEN_STATUSES.includes(o.status))
  const urgent = openOrders.filter((o) => o.priority === 'havarie' || o.priority === 'vysoka')
  const upcoming = openOrders
    .filter((o) => o.scheduledAt)
    .sort((a, b) => (a.scheduledAt! < b.scheduledAt! ? -1 : 1))
    .slice(0, 6)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Přehled</h1>
        <p className="text-sm text-slate-500">Vítejte zpět, {user?.name}.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Otevřené zakázky" value={openOrders.length} to="/zakazky" />
        <StatCard label="Vysoká priorita / havárie" value={urgent.length} to="/zakazky" tone="danger" />
        <StatCard label="Zákazníci" value={customers.length} to="/zakaznici" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Nejbližší naplánované zásahy</h2>
          {upcoming.length === 0 && <p className="text-sm text-slate-400">Žádné naplánované zásahy.</p>}
          <ul className="space-y-3">
            {upcoming.map((o) => (
              <li key={o.id}>
                <Link to={`/zakazky/${o.id}`} className="block rounded-md p-2 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">{o.number}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="text-sm text-slate-600">{customerName(o.customerId)}</p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(o.scheduledAt)} · {technicianName(o.assignedTechnicianId)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Urgentní zakázky</h2>
          {urgent.length === 0 && <p className="text-sm text-slate-400">Žádné urgentní zakázky.</p>}
          <ul className="space-y-3">
            {urgent.map((o) => (
              <li key={o.id}>
                <Link to={`/zakazky/${o.id}`} className="block rounded-md p-2 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">{o.number}</span>
                    <OrderPriorityBadge priority={o.priority} />
                  </div>
                  <p className="text-sm text-slate-600">{customerName(o.customerId)}</p>
                  <p className="line-clamp-1 text-xs text-slate-400">{o.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  to,
  tone = 'default',
}: {
  label: string
  value: number
  to: string
  tone?: 'default' | 'danger'
}) {
  return (
    <Link to={to}>
      <Card className="p-4 hover:border-slate-300">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${tone === 'danger' ? 'text-red-600' : 'text-slate-900'}`}>
          {value}
        </p>
      </Card>
    </Link>
  )
}
