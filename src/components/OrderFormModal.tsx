import { useState } from 'react'
import type { Customer, Device, OrderPriority, OrderType, User } from '../types'
import { newId, nextOrderNumber, ordersTable } from '../data/repository'
import { useAuth } from '../context/AuthContext'
import { Modal } from './ui/Modal'
import { FieldGroup, Input, Select, Textarea } from './ui/Field'
import { Button } from './ui/Button'
import { orderPriorityLabels, orderTypeLabels } from '../lib/labels'

export function OrderFormModal({
  customers,
  devices,
  technicians,
  defaultCustomerId,
  onClose,
  onSaved,
}: {
  customers: Customer[]
  devices: Device[]
  technicians: User[]
  defaultCustomerId?: string
  onClose: () => void
  onSaved: () => void
}) {
  const { user } = useAuth()
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? customers[0]?.id ?? '')
  const [deviceId, setDeviceId] = useState('')
  const [type, setType] = useState<OrderType>('oprava')
  const [priority, setPriority] = useState<OrderPriority>('normalni')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('')
  const [saving, setSaving] = useState(false)

  const customerDevices = devices.filter((d) => d.customerId === customerId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const number = await nextOrderNumber()
    await ordersTable.insert({
      id: newId(),
      number,
      customerId,
      deviceId: deviceId || undefined,
      type,
      status: scheduledAt ? 'naplanovana' : 'nova',
      priority,
      description,
      assignedTechnicianId: assignedTechnicianId || undefined,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      parts: [],
      laborPrice: 0,
      notes: [],
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    })
    setSaving(false)
    onSaved()
  }

  return (
    <Modal title="Nová zakázka" onClose={onClose} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Zákazník">
            <Select
              required
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value)
                setDeviceId('')
              }}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup label="Zařízení (nepovinné)">
            <Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
              <option value="">— nevybráno —</option>
              {customerDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.manufacturer} {d.model}
                </option>
              ))}
            </Select>
          </FieldGroup>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FieldGroup label="Typ zakázky">
            <Select value={type} onChange={(e) => setType(e.target.value as OrderType)}>
              {Object.entries(orderTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup label="Priorita">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as OrderPriority)}>
              {Object.entries(orderPriorityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup label="Termín zásahu">
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </FieldGroup>
        </div>

        <FieldGroup label="Technik">
          <Select value={assignedTechnicianId} onChange={(e) => setAssignedTechnicianId(e.target.value)}>
            <option value="">Nepřiřazeno</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup label="Popis závady / požadavku">
          <Textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FieldGroup>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Zrušit
          </Button>
          <Button type="submit" disabled={saving || !customerId}>
            {saving ? 'Ukládání…' : 'Vytvořit zakázku'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
