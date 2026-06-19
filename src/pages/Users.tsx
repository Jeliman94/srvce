import { useState } from 'react'
import { useEntities } from '../hooks/useEntities'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { roleLabels } from '../lib/permissions'
import { usersTable } from '../data/repository'
import { UserFormModal } from '../components/UserFormModal'
import { UserPermissionsModal } from '../components/UserPermissionsModal'
import type { User } from '../types'

export default function Users() {
  const { user: currentUser } = useAuth()
  const { users, loading, reload } = useEntities()
  const [editing, setEditing] = useState<User | undefined>()
  const [editingPermissions, setEditingPermissions] = useState<User | undefined>()
  const [showForm, setShowForm] = useState(false)

  async function toggleActive(u: User) {
    if (u.id === currentUser?.id) return
    await usersTable.update(u.id, { active: !u.active })
    reload()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Uživatelé</h1>
        <Button onClick={() => setShowForm(true)}>+ Nový uživatel</Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Načítání…</p>
      ) : (
        <Card className="divide-y divide-slate-100">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {u.name} {!u.active && <span className="text-xs text-slate-400">(neaktivní)</span>}
                </p>
                <p className="text-xs text-slate-500">
                  {roleLabels[u.role]} · {u.email} {u.phone && `· ${u.phone}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setEditing(u)}>
                  Upravit
                </Button>
                <Button variant="secondary" onClick={() => setEditingPermissions(u)}>
                  Oprávnění
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => toggleActive(u)}
                  disabled={u.id === currentUser?.id}
                >
                  {u.active ? 'Deaktivovat' : 'Aktivovat'}
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {showForm && (
        <UserFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            reload()
          }}
        />
      )}
      {editing && (
        <UserFormModal
          user={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined)
            reload()
          }}
        />
      )}
      {editingPermissions && (
        <UserPermissionsModal
          user={editingPermissions}
          onClose={() => setEditingPermissions(undefined)}
          onSaved={() => {
            setEditingPermissions(undefined)
            reload()
          }}
        />
      )}
    </div>
  )
}
