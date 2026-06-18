import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { useAuth } from '../context/AuthContext'
import { can, canEditOrder } from '../lib/permissions'
import {
  orderPriorityLabels,
  orderStatusLabels,
  orderStatusOrder,
  orderTypeLabels,
} from '../lib/labels'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FieldGroup, Input, Select, Textarea } from '../components/ui/Field'
import { OrderPriorityBadge, OrderStatusBadge } from '../components/StatusBadge'
import { formatDateTime, formatMoney, toDatetimeInputValue } from '../lib/format'
import { newId, ordersTable } from '../data/repository'
import type { OrderPart, OrderPriority, ServiceOrder, OrderStatus } from '../types'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { orders, devices, users, loading, reload, customerName, deviceLabel } = useEntities()
  const [noteText, setNoteText] = useState('')
  const [partName, setPartName] = useState('')
  const [partQty, setPartQty] = useState(1)
  const [partPrice, setPartPrice] = useState(0)

  if (loading) return <p className="text-sm text-slate-400">Načítání…</p>

  const found = orders.find((o) => o.id === id)
  if (!found) return <p className="text-sm text-slate-500">Zakázka nenalezena.</p>
  const order = found

  const editable = canEditOrder(user)
  const technicians = users.filter((u) => u.role === 'technik')
  const customerDevices = devices.filter((d) => d.customerId === order.customerId)
  const partsTotal = order.parts.reduce((sum, p) => sum + p.qty * p.unitPrice, 0)
  const total = partsTotal + order.laborPrice

  async function patch(data: Partial<ServiceOrder>) {
    await ordersTable.update(order.id, data)
    reload()
  }

  async function handleAddNote() {
    if (!noteText.trim() || !user) return
    const note = { id: newId(), authorId: user.id, text: noteText.trim(), createdAt: new Date().toISOString() }
    await patch({ notes: [...order.notes, note] })
    setNoteText('')
  }

  async function handleAddPart() {
    if (!partName.trim()) return
    const part: OrderPart = { id: newId(), name: partName.trim(), qty: partQty, unitPrice: partPrice }
    await patch({ parts: [...order.parts, part] })
    setPartName('')
    setPartQty(1)
    setPartPrice(0)
  }

  async function handleRemovePart(partId: string) {
    await patch({ parts: order.parts.filter((p) => p.id !== partId) })
  }

  async function handleDelete() {
    if (!confirm(`Opravdu smazat zakázku ${order.number}?`)) return
    await ordersTable.remove(order.id)
    navigate('/zakazky')
  }

  function authorName(authorId: string) {
    return users.find((u) => u.id === authorId)?.name ?? '—'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/zakazky" className="text-sm text-slate-400 hover:underline">
            ← Zakázky
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{order.number}</h1>
          <p className="text-sm text-slate-500">
            {orderTypeLabels[order.type]} ·{' '}
            <Link to={`/zakaznici/${order.customerId}`} className="hover:underline">
              {customerName(order.customerId)}
            </Link>
            {order.deviceId && ` · ${deviceLabel(order.deviceId)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <OrderPriorityBadge priority={order.priority} />
          {can(user, 'deleteOrder') && (
            <Button variant="danger" onClick={handleDelete}>
              Smazat
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Popis</h2>
            <p className="text-sm text-slate-700">{order.description}</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Náhradní díly a práce</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400">
                  <th className="pb-2">Položka</th>
                  <th className="pb-2">Ks</th>
                  <th className="pb-2">Cena/ks</th>
                  <th className="pb-2">Celkem</th>
                  {editable && <th />}
                </tr>
              </thead>
              <tbody>
                {order.parts.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.qty}</td>
                    <td className="py-2">{formatMoney(p.unitPrice)}</td>
                    <td className="py-2">{formatMoney(p.qty * p.unitPrice)}</td>
                    {editable && (
                      <td className="py-2 text-right">
                        <button
                          onClick={() => handleRemovePart(p.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Odebrat
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                <tr className="border-t border-slate-100">
                  <td className="py-2 text-slate-500">Práce technika</td>
                  <td colSpan={2}></td>
                  <td className="py-2">
                    {editable ? (
                      <Input
                        type="number"
                        min={0}
                        value={order.laborPrice}
                        onChange={(e) => patch({ laborPrice: Number(e.target.value) })}
                        className="w-28 py-1"
                      />
                    ) : (
                      formatMoney(order.laborPrice)
                    )}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 font-semibold">
                  <td className="py-2" colSpan={3}>
                    Celkem
                  </td>
                  <td className="py-2">{formatMoney(total)}</td>
                </tr>
              </tfoot>
            </table>

            {editable && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                <Input
                  placeholder="Název dílu"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="col-span-2"
                />
                <Input
                  type="number"
                  min={1}
                  value={partQty}
                  onChange={(e) => setPartQty(Number(e.target.value))}
                  placeholder="Ks"
                />
                <Input
                  type="number"
                  min={0}
                  value={partPrice}
                  onChange={(e) => setPartPrice(Number(e.target.value))}
                  placeholder="Cena/ks"
                />
                <Button type="button" variant="secondary" onClick={handleAddPart} className="col-span-4">
                  + Přidat položku
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Historie a poznámky</h2>
            <ul className="space-y-3">
              {order.notes.length === 0 && <p className="text-sm text-slate-400">Žádné poznámky.</p>}
              {order.notes
                .slice()
                .reverse()
                .map((n) => (
                  <li key={n.id} className="rounded-md bg-slate-50 p-3 text-sm">
                    <p className="text-slate-700">{n.text}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {authorName(n.authorId)} · {formatDateTime(n.createdAt)}
                    </p>
                  </li>
                ))}
            </ul>
            {editable && (
              <div className="mt-4 space-y-2">
                <Textarea
                  rows={2}
                  placeholder="Přidat poznámku…"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={handleAddNote}>
                  Přidat poznámku
                </Button>
              </div>
            )}
          </Card>
        </div>

        <Card className="h-fit p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Detaily</h2>
          <div className="space-y-3">
            <FieldGroup label="Stav">
              <Select
                disabled={!editable}
                value={order.status}
                onChange={(e) => patch({ status: e.target.value as OrderStatus })}
              >
                {[...orderStatusOrder, 'zrusena' as OrderStatus].map((s) => (
                  <option key={s} value={s}>
                    {orderStatusLabels[s]}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="Priorita">
              <Select
                disabled={!editable}
                value={order.priority}
                onChange={(e) => patch({ priority: e.target.value as OrderPriority })}
              >
                {Object.entries(orderPriorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="Technik">
              <Select
                disabled={!can(user, 'scheduleOrder')}
                value={order.assignedTechnicianId ?? ''}
                onChange={(e) => patch({ assignedTechnicianId: e.target.value || undefined })}
              >
                <option value="">Nepřiřazeno</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="Termín zásahu">
              <Input
                type="datetime-local"
                disabled={!can(user, 'scheduleOrder')}
                value={toDatetimeInputValue(order.scheduledAt)}
                onChange={(e) =>
                  patch({ scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                }
              />
            </FieldGroup>
            <FieldGroup label="Čas příjezdu">
              <Input
                type="datetime-local"
                disabled={!editable}
                value={toDatetimeInputValue(order.workStartedAt)}
                onChange={(e) =>
                  patch({ workStartedAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                }
              />
            </FieldGroup>
            <FieldGroup label="Čas odjezdu">
              <Input
                type="datetime-local"
                disabled={!editable}
                value={toDatetimeInputValue(order.workEndedAt)}
                onChange={(e) =>
                  patch({ workEndedAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                }
              />
            </FieldGroup>
            {order.deviceId && customerDevices.length > 0 && (
              <FieldGroup label="Zařízení">
                <Select
                  disabled={!editable}
                  value={order.deviceId}
                  onChange={(e) => patch({ deviceId: e.target.value || undefined })}
                >
                  {customerDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.manufacturer} {d.model}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
