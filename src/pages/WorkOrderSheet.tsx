import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { useAuth } from '../context/AuthContext'
import { canEditOrder } from '../lib/permissions'
import { orderTypeLabels } from '../lib/labels'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SignaturePad } from '../components/SignaturePad'
import { formatDate, formatDateTime } from '../lib/format'
import { ordersTable } from '../data/repository'

export default function WorkOrderSheet() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { orders, customers, loading, reload } = useEntities()
  const [signature, setSignature] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (loading) return <p className="text-sm text-slate-400">Načítání…</p>

  const found = orders.find((o) => o.id === id)
  if (!found) return <p className="text-sm text-slate-500">Zakázka nenalezena.</p>
  const order = found

  const customer = customers.find((c) => c.id === order.customerId)
  const editable = canEditOrder(user)

  async function handleSaveSignature() {
    if (!signature) return
    setSaving(true)
    await ordersTable.update(order.id, {
      customerSignature: signature,
      signedAt: new Date().toISOString(),
    })
    setSaving(false)
    reload()
  }

  async function handleResign() {
    await ordersTable.update(order.id, { customerSignature: undefined, signedAt: undefined })
    reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link to={`/zakazky/${order.id}`} className="text-sm text-slate-400 hover:underline">
          ← Zakázka {order.number}
        </Link>
        <Button variant="secondary" onClick={() => window.print()}>
          Tisk
        </Button>
      </div>

      <Card className="space-y-6 p-8 print:border-none print:shadow-none">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">VrataServis</p>
            <p className="text-xs text-slate-500">Servis vrat, bran a závor</p>
            <p className="text-xs text-slate-500">K Chaloupkám 92, 503 21 Stěžery</p>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-semibold text-slate-900">Zakázkový list</h1>
            <p className="text-sm text-slate-500">{order.number}</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase text-slate-400">Zákazník</h2>
            {customer ? (
              <div className="text-sm text-slate-700">
                <p className="font-medium text-slate-900">{customer.name}</p>
                <p>
                  {customer.street}, {customer.city} {customer.zip}
                </p>
                <p>{customer.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase text-slate-400">Zakázka</h2>
            <div className="text-sm text-slate-700">
              <p>Typ: {orderTypeLabels[order.type]}</p>
              <p>Přijato: {formatDate(order.createdAt)}</p>
              {order.scheduledAt && <p>Termín: {formatDateTime(order.scheduledAt)}</p>}
              {order.completedAt && <p>Dokončeno: {formatDate(order.completedAt)}</p>}
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-1 text-xs font-semibold uppercase text-slate-400">Popis zakázky</h2>
          <p className="text-sm text-slate-700">{order.description}</p>
        </div>

        <div>
          <h2 className="mb-1 text-xs font-semibold uppercase text-slate-400">
            Provedená práce a materiál
          </h2>
          {order.parts.length === 0 ? (
            <p className="text-sm text-slate-400">—</p>
          ) : (
            <ul className="text-sm text-slate-700">
              {order.parts.map((p) => (
                <li key={p.id}>
                  {p.name} ×{p.qty}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h2 className="mb-2 text-xs font-semibold uppercase text-slate-400">Podpis zákazníka</h2>
          {order.customerSignature ? (
            <div className="space-y-2">
              <img
                src={order.customerSignature}
                alt="Podpis zákazníka"
                className="h-32 w-64 rounded-md border border-slate-200 bg-white object-contain"
              />
              <p className="text-xs text-slate-400">Podepsáno {formatDateTime(order.signedAt)}</p>
              {editable && (
                <Button variant="secondary" className="print:hidden" onClick={handleResign}>
                  Podepsat znovu
                </Button>
              )}
            </div>
          ) : editable ? (
            <div className="max-w-md space-y-3 print:hidden">
              <SignaturePad onChange={setSignature} />
              <Button disabled={!signature || saving} onClick={handleSaveSignature}>
                {saving ? 'Ukládání…' : 'Uložit podpis'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Zakázka ještě není podepsaná.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
