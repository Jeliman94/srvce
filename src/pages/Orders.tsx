import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { useAuth } from '../context/AuthContext'
import { can, canEditOrder } from '../lib/permissions'
import { orderStatusLabels, orderStatusOrder } from '../lib/labels'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Field'
import { OrderPriorityBadge } from '../components/StatusBadge'
import { formatDate } from '../lib/format'
import type { OrderStatus } from '../types'
import { ordersTable } from '../data/repository'
import { OrderFormModal } from '../components/OrderFormModal'

export default function Orders() {
  const { user } = useAuth()
  const { orders, customers, devices, users, loading, reload, customerName, technicianName } = useEntities()
  const [showCancelled, setShowCancelled] = useState(false)
  const [technicianFilter, setTechnicianFilter] = useState('all')
  const [mineOnly, setMineOnly] = useState(user?.role === 'technik')
  const [showForm, setShowForm] = useState(false)

  const technicians = users.filter((u) => u.role === 'technik')

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (mineOnly && user && o.assignedTechnicianId !== user.id) return false
      if (technicianFilter !== 'all' && o.assignedTechnicianId !== technicianFilter) return false
      return true
    })
  }, [orders, mineOnly, technicianFilter, user])

  const columns = showCancelled ? [...orderStatusOrder, 'zrusena' as OrderStatus] : orderStatusOrder

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    const patch: Partial<{ status: OrderStatus; completedAt: string }> = { status }
    if (status === 'hotovo') patch.completedAt = new Date().toISOString()
    await ordersTable.update(orderId, patch)
    reload()
  }

  if (loading) return <p className="text-sm text-slate-400">Načítání…</p>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Zakázky</h1>
        {can(user, 'createOrder') && <Button onClick={() => setShowForm(true)}>+ Nová zakázka</Button>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {user?.role !== 'technik' && (
          <Select
            value={technicianFilter}
            onChange={(e) => setTechnicianFilter(e.target.value)}
            className="max-w-xs"
          >
            <option value="all">Všichni technici</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        )}
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
          Jen moje zakázky
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showCancelled}
            onChange={(e) => setShowCancelled(e.target.checked)}
          />
          Zobrazit zrušené
        </label>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => {
          const columnOrders = filtered.filter((o) => o.status === status)
          return (
            <div key={status} className="w-72 flex-shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-slate-700">{orderStatusLabels[status]}</h2>
                <span className="text-xs text-slate-400">{columnOrders.length}</span>
              </div>
              <div className="space-y-3">
                {columnOrders.map((order) => {
                  const editable = canEditOrder(user, order)
                  return (
                    <Card key={order.id} className="p-3">
                      <Link to={`/zakazky/${order.id}`} className="block">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900">{order.number}</span>
                          <OrderPriorityBadge priority={order.priority} />
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{customerName(order.customerId)}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{order.description}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(order.scheduledAt)} · {technicianName(order.assignedTechnicianId)}
                        </p>
                      </Link>
                      {editable && status !== 'zrusena' && (
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="mt-2 py-1 text-xs"
                        >
                          {[...orderStatusOrder, 'zrusena' as OrderStatus].map((s) => (
                            <option key={s} value={s}>
                              {orderStatusLabels[s]}
                            </option>
                          ))}
                        </Select>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <OrderFormModal
          customers={customers}
          devices={devices}
          technicians={technicians}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            reload()
          }}
        />
      )}
    </div>
  )
}
