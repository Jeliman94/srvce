import { useState } from 'react'
import type { Device, DeviceType } from '../types'
import { devicesTable, newId } from '../data/repository'
import { Modal } from './ui/Modal'
import { FieldGroup, Input, Select, Textarea } from './ui/Field'
import { Button } from './ui/Button'
import { deviceTypeLabels } from '../lib/labels'

export function DeviceFormModal({
  customerId,
  device,
  onClose,
  onSaved,
}: {
  customerId: string
  device?: Device
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    type: device?.type ?? ('vrata' as DeviceType),
    manufacturer: device?.manufacturer ?? '',
    model: device?.model ?? '',
    serialNumber: device?.serialNumber ?? '',
    installDate: device?.installDate?.slice(0, 10) ?? '',
    warrantyUntil: device?.warrantyUntil?.slice(0, 10) ?? '',
    location: device?.location ?? '',
    note: device?.note ?? '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      installDate: form.installDate ? new Date(form.installDate).toISOString() : undefined,
      warrantyUntil: form.warrantyUntil ? new Date(form.warrantyUntil).toISOString() : undefined,
    }
    if (device) {
      await devicesTable.update(device.id, payload)
    } else {
      await devicesTable.insert({
        id: newId(),
        customerId,
        createdAt: new Date().toISOString(),
        ...payload,
      })
    }
    setSaving(false)
    onSaved()
  }

  return (
    <Modal title={device ? 'Upravit zařízení' : 'Nové zařízení'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Typ zařízení">
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as DeviceType })}
            >
              {Object.entries(deviceTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup label="Umístění (pokud jiné než adresa)">
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </FieldGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Výrobce">
            <Input
              required
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="Model">
            <Input
              required
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </FieldGroup>
        </div>

        <FieldGroup label="Výrobní / sériové číslo">
          <Input
            value={form.serialNumber}
            onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
          />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Datum instalace">
            <Input
              type="date"
              value={form.installDate}
              onChange={(e) => setForm({ ...form, installDate: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="Záruka do">
            <Input
              type="date"
              value={form.warrantyUntil}
              onChange={(e) => setForm({ ...form, warrantyUntil: e.target.value })}
            />
          </FieldGroup>
        </div>

        <FieldGroup label="Poznámka">
          <Textarea
            rows={2}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
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
