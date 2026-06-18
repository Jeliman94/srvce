import { useState } from 'react'
import type { PermissionAction, User } from '../types'
import { usersTable } from '../data/repository'
import { Modal } from './ui/Modal'
import { Select } from './ui/Field'
import { Button } from './ui/Button'
import { actionLabels, defaultCan, permissionActions, roleLabels } from '../lib/permissions'

type OverrideValue = 'default' | 'allow' | 'deny'

function overrideValue(user: User, action: PermissionAction): OverrideValue {
  const override = user.permissionOverrides?.[action]
  if (override === true) return 'allow'
  if (override === false) return 'deny'
  return 'default'
}

export function UserPermissionsModal({
  user,
  onClose,
  onSaved,
}: {
  user: User
  onClose: () => void
  onSaved: () => void
}) {
  const [values, setValues] = useState<Record<PermissionAction, OverrideValue>>(() => {
    const initial = {} as Record<PermissionAction, OverrideValue>
    for (const action of permissionActions) initial[action] = overrideValue(user, action)
    return initial
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const permissionOverrides: Partial<Record<PermissionAction, boolean>> = {}
    for (const action of permissionActions) {
      if (values[action] === 'allow') permissionOverrides[action] = true
      if (values[action] === 'deny') permissionOverrides[action] = false
    }
    await usersTable.update(user.id, { permissionOverrides })
    setSaving(false)
    onSaved()
  }

  return (
    <Modal title={`Oprávnění – ${user.name}`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Výchozí oprávnění podle role ({roleLabels[user.role]}) lze pro tohoto uživatele jednotlivě
          přepsat.
        </p>
        <div className="space-y-3">
          {permissionActions.map((action) => {
            const roleDefault = defaultCan(user.role, action) ? 'povoleno' : 'zakázáno'
            return (
              <div key={action} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{actionLabels[action]}</p>
                  <p className="text-xs text-slate-400">Výchozí pro roli: {roleDefault}</p>
                </div>
                <Select
                  className="w-44"
                  value={values[action]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [action]: e.target.value as OverrideValue }))
                  }
                >
                  <option value="default">Výchozí (podle role)</option>
                  <option value="allow">Povoleno</option>
                  <option value="deny">Zakázáno</option>
                </Select>
              </div>
            )
          })}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Zrušit
          </Button>
          <Button type="button" disabled={saving} onClick={handleSave}>
            {saving ? 'Ukládání…' : 'Uložit'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
