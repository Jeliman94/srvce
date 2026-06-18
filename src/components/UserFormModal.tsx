import { useState } from 'react'
import type { Role, User } from '../types'
import { newId, usersTable } from '../data/repository'
import { Modal } from './ui/Modal'
import { FieldGroup, Input, Select } from './ui/Field'
import { Button } from './ui/Button'
import { roleLabels } from '../lib/permissions'

export function UserFormModal({
  user,
  onClose,
  onSaved,
}: {
  user?: User
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    role: user?.role ?? ('technik' as Role),
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (user) {
      await usersTable.update(user.id, form)
    } else {
      await usersTable.insert({
        id: newId(),
        active: true,
        createdAt: new Date().toISOString(),
        ...form,
      })
    }
    setSaving(false)
    onSaved()
  }

  return (
    <Modal title={user ? 'Upravit uživatele' : 'Nový uživatel'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldGroup label="Jméno">
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="E-mail">
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="Telefon">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </FieldGroup>
        </div>
        <FieldGroup label="Role">
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Zrušit
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Ukládání…' : 'Uložit'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
