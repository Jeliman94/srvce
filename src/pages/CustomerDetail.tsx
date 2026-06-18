import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { OrderStatusBadge } from '../components/StatusBadge'
import { deviceTypeLabels } from '../lib/labels'
import { formatDate } from '../lib/format'
import { can } from '../lib/permissions'
import { useAuth } from '../context/AuthContext'
import { CustomerFormModal } from '../components/CustomerFormModal'
import { DeviceFormModal } from '../components/DeviceFormModal'
import { OrderFormModal } from '../components/OrderFormModal'
import { customersTable } from '../data/repository'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { customers, devices, orders, users, loading, reload } = useEntities()
  const [editCustomer, setEditCustomer] = useState(false)
  const [addDevice, setAddDevice] = useState(false)
  const [addOrder, setAddOrder] = useState(false)

  if (loading) return <p className="text-sm text-slate-400">Načítání…</p>

  const found = customers.find((c) => c.id === id)
  if (!found) return <p className="text-sm text-slate-500">Zákazník nenalezen.</p>
  const customer = found

  const customerDevices = devices.filter((d) => d.customerId === customer.id)
  const customerOrders = orders
    .filter((o) => o.customerId === customer.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  const technicians = users.filter((u) => u.role === 'technik')

  async function handleDelete() {
    if (!confirm(`Opravdu smazat zákazníka ${customer.name}?`)) return
    await customersTable.remove(customer.id)
    navigate('/zakaznici')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/zakaznici" className="text-sm text-slate-400 hover:underline">
            ← Zákazníci
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{customer.name}</h1>
          <p className="text-sm text-slate-500">
            {customer.street}, {customer.city} {customer.zip}
          </p>
        </div>
        {can(user, 'manageCustomers') && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditCustomer(true)}>
              Upravit
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Smazat
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Kontaktní údaje</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Typ" value={customer.type === 'firma' ? 'Firma' : 'Fyzická osoba'} />
            {customer.ico && <Row label="IČO" value={customer.ico} />}
            {customer.dic && <Row label="DIČ" value={customer.dic} />}
            <Row label="Telefon" value={customer.phone} />
            {customer.email && <Row label="E-mail" value={customer.email} />}
            {customer.note && <Row label="Poznámka" value={customer.note} />}
          </dl>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Zařízení</h2>
              {can(user, 'manageDevices') && (
                <Button variant="secondary" onClick={() => setAddDevice(true)}>
                  + Zařízení
                </Button>
              )}
            </div>
            {customerDevices.length === 0 && (
              <p className="text-sm text-slate-400">Žádná evidovaná zařízení.</p>
            )}
            <ul className="space-y-2">
              {customerDevices.map((d) => (
                <li key={d.id} className="rounded-md border border-slate-100 p-3 text-sm">
                  <p className="font-medium text-slate-900">
                    {deviceTypeLabels[d.type]} – {d.manufacturer} {d.model}
                  </p>
                  <p className="text-xs text-slate-500">
                    {d.serialNumber && `SN: ${d.serialNumber} · `}
                    {d.location && `${d.location} · `}
                    Instalace: {formatDate(d.installDate)} · Záruka do: {formatDate(d.warrantyUntil)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Zakázky</h2>
              {can(user, 'createOrder') && (
                <Button variant="secondary" onClick={() => setAddOrder(true)}>
                  + Zakázka
                </Button>
              )}
            </div>
            {customerOrders.length === 0 && <p className="text-sm text-slate-400">Žádné zakázky.</p>}
            <ul className="space-y-2">
              {customerOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    to={`/zakazky/${o.id}`}
                    className="flex items-center justify-between rounded-md border border-slate-100 p-3 text-sm hover:bg-slate-50"
                  >
                    <span>
                      <span className="font-medium text-slate-900">{o.number}</span>
                      <span className="ml-2 text-slate-500">{o.description.slice(0, 50)}</span>
                    </span>
                    <OrderStatusBadge status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {editCustomer && (
        <CustomerFormModal
          customer={customer}
          onClose={() => setEditCustomer(false)}
          onSaved={() => {
            setEditCustomer(false)
            reload()
          }}
        />
      )}
      {addDevice && (
        <DeviceFormModal
          customerId={customer.id}
          onClose={() => setAddDevice(false)}
          onSaved={() => {
            setAddDevice(false)
            reload()
          }}
        />
      )}
      {addOrder && (
        <OrderFormModal
          customers={[customer]}
          devices={customerDevices}
          technicians={technicians}
          defaultCustomerId={customer.id}
          onClose={() => setAddOrder(false)}
          onSaved={() => {
            setAddOrder(false)
            reload()
          }}
        />
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{value}</dd>
    </div>
  )
}
