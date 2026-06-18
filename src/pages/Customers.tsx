import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { can } from '../lib/permissions'
import { useAuth } from '../context/AuthContext'
import { CustomerFormModal } from '../components/CustomerFormModal'

export default function Customers() {
  const { user } = useAuth()
  const { customers, loading, reload } = useEntities()
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)

  const filtered = customers.filter((c) =>
    `${c.name} ${c.city} ${c.phone}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Zákazníci</h1>
        {can(user, 'manageCustomers') && (
          <Button onClick={() => setShowForm(true)}>+ Nový zákazník</Button>
        )}
      </div>

      <Input
        placeholder="Hledat podle jména, města nebo telefonu…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <p className="text-sm text-slate-400">Načítání…</p>
      ) : (
        <Card className="divide-y divide-slate-100">
          {filtered.length === 0 && <p className="p-4 text-sm text-slate-400">Žádní zákazníci.</p>}
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/zakaznici/${c.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">
                  {c.street}, {c.city} · {c.phone}
                </p>
              </div>
              <span className="text-xs uppercase text-slate-400">{c.type}</span>
            </Link>
          ))}
        </Card>
      )}

      {showForm && (
        <CustomerFormModal
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
