import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { Card } from '../components/ui/Card'
import { Select } from '../components/ui/Field'
import { deviceTypeLabels } from '../lib/labels'
import { formatDate } from '../lib/format'
import type { DeviceType } from '../types'

export default function Devices() {
  const { devices, customers, loading } = useEntities()
  const [typeFilter, setTypeFilter] = useState<DeviceType | 'all'>('all')

  const filtered = devices.filter((d) => typeFilter === 'all' || d.type === typeFilter)

  function customerName(customerId: string) {
    return customers.find((c) => c.id === customerId)?.name ?? '—'
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Zařízení</h1>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as DeviceType | 'all')}
          className="max-w-xs"
        >
          <option value="all">Všechny typy</option>
          {Object.entries(deviceTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Načítání…</p>
      ) : (
        <Card className="divide-y divide-slate-100">
          {filtered.length === 0 && <p className="p-4 text-sm text-slate-400">Žádná zařízení.</p>}
          {filtered.map((d) => (
            <Link
              key={d.id}
              to={`/zakaznici/${d.customerId}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {deviceTypeLabels[d.type]} – {d.manufacturer} {d.model}
                </p>
                <p className="text-xs text-slate-500">
                  {customerName(d.customerId)}
                  {d.location && ` · ${d.location}`}
                </p>
              </div>
              <p className="text-xs text-slate-400">Záruka do: {formatDate(d.warrantyUntil)}</p>
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
