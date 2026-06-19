import { useEffect, useState } from 'react'
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
import { formatDateTime, toDatetimeInputValue } from '../lib/format'
import { newId, ordersTable } from '../data/repository'
import type { OrderNote, OrderPart, OrderPriority, OrderStatus } from '../types'

interface OrderDraft {
  status: OrderStatus
  priority: OrderPriority
  assignedTechnicianId: string
  scheduledAt: string
  workStartedAt: string
  workEndedAt: string
  parts: OrderPart[]
  notes: OrderNote[]
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { orders, users, loading, customerName } = useEntities()
  const [noteText, setNoteText] = useState('')
  const [partName, setPartName] = useState('')
  const [partQty, setPartQty] = useState(1)
  const [draft, setDraft] = useState<OrderDraft | null>(null)

  const found = orders.find((o) => o.id === id)

  useEffect(() => {
    if (found && draft === null) {
      setDraft({
        status: found.status,
        priority: found.priority,
        assignedTechnicianId: found.assignedTechnicianId ?? '',
        scheduledAt: toDatetimeInputValue(found.scheduledAt),
        workStartedAt: toDatetimeInputValue(found.workStartedAt),
        workEndedAt: toDatetimeInputValue(found.workEndedAt),
        parts: found.parts,
        notes: found.notes,
      })
    }
  }, [found, draft])

  if (loading || !draft) return <p className="text-sm text-slate-400">Načítání…</p>
  if (!found) return <p className="text-sm text-slate-500">Zakázka nenalezena.</p>
  const order = found

  const editable = canEditOrder(user)
  const technicians = users.filter((u) => u.role === 'technik')

  function update(patch: Partial<OrderDraft>) {
    setDraft((d) => (d ? { ...d, ...patch } : d))
  }

  const handleAddNote = () => {
    if (!noteText.trim() || !user) return
    const note: OrderNote = { id: newId(), authorId: user.id, text: noteText.trim(), createdAt: new Date().toISOString() }
    update({ notes: [...draft.notes, note] })
    setNoteText('')
  }

  const handleAddPart = () => {
    if (!partName.trim()) return
    const part: OrderPart = { id: newId(), name: partName.trim(), qty: partQty, unitPrice: 0 }
    update({ parts: [...draft.parts, part] })
    setPartName('')
    setPartQty(1)
  }

  const handleRemovePart = (partId: string) => {
    update({ parts: draft.parts.filter((p) => p.id !== partId) })
  }

  async function handleDelete() {
    if (!confirm(`Opravdu smazat zakázku ${order.number}?`)) return
    await ordersTable.remove(order.id)
    navigate('/zakazky')
  }

  const handleConfirm = async () => {
    await ordersTable.update(order.id, {
      status: draft.status,
      priority: draft.priority,
      assignedTechnicianId: draft.assignedTechnicianId || undefined,
      scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : undefined,
      workStartedAt: draft.workStartedAt ? new Date(draft.workStartedAt).toISOString() : undefined,
      workEndedAt: draft.workEndedAt ? new Date(draft.workEndedAt).toISOString() : undefined,
      parts: draft.parts,
      notes: draft.notes,
      ...(draft.status === 'hotovo' ? { completedAt: new Date().toISOString() } : {}),
    })
    if (user?.role === 'technik' && draft.status === 'hotovo') {
      navigate(`/zakazky/${order.id}/vyuctovani`)
    } else {
      navigate('/zakazky')
    }
  }

  function authorName(authorId: string) {
    return users.find((u) => u.id === authorId)?.name ?? '—'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={draft.status} />
          <OrderPriorityBadge priority={draft.priority} />
          <Link to={`/zakazky/${order.id}/vyuctovani`}>
            <Button variant="secondary">Vyúčtování</Button>
          </Link>
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
                  {editable && <th />}
                </tr>
              </thead>
              <tbody>
                {draft.parts.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.qty}</td>
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
              </tbody>
            </table>

            {editable && (
              <div className="mt-4 grid grid-cols-3 gap-2">
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
                <Button type="button" variant="secondary" onClick={handleAddPart} className="col-span-3">
                  + Přidat položku
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Historie a poznámky</h2>
            <ul className="space-y-3">
              {draft.notes.length === 0 && <p className="text-sm text-slate-400">Žádné poznámky.</p>}
              {draft.notes
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
                value={draft.status}
                onChange={(e) => update({ status: e.target.value as OrderStatus })}
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
                value={draft.priority}
                onChange={(e) => update({ priority: e.target.value as OrderPriority })}
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
                value={draft.assignedTechnicianId}
                onChange={(e) => update({ assignedTechnicianId: e.target.value })}
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
                value={draft.scheduledAt}
                onChange={(e) => {
                  const scheduledAt = e.target.value
                  update({
                    scheduledAt,
                    ...(scheduledAt && draft.status === 'nova' ? { status: 'naplanovana' } : {}),
                  })
                }}
              />
            </FieldGroup>
            <FieldGroup label="Čas příjezdu">
              <Input
                type="datetime-local"
                disabled={!editable}
                value={draft.workStartedAt}
                onChange={(e) => update({ workStartedAt: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Čas odjezdu">
              <Input
                type="datetime-local"
                disabled={!editable}
                value={draft.workEndedAt}
                onChange={(e) => update({ workEndedAt: e.target.value })}
              />
            </FieldGroup>
            {editable && draft.status !== 'zrusena' && (
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${
                  draft.status === 'hotovo'
                    ? 'cursor-default border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={draft.status === 'hotovo'}
                  disabled={draft.status === 'hotovo'}
                  onChange={() => update({ status: 'hotovo' })}
                />
                Servis hotov
              </label>
            )}
          </div>
        </Card>
      </div>

      {editable && (
        <div className="flex justify-end">
          <Button onClick={handleConfirm}>Potvrdit</Button>
        </div>
      )}
    </div>
  )
}
