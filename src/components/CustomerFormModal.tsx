import { useState } from 'react'
import type { Customer, CustomerType } from '../types'
import { customersTable, newId } from '../data/repository'
import { Modal } from './ui/Modal'
import { FieldGroup, Input, Select, Textarea } from './ui/Field'
import { Button } from './ui/Button'

export function CustomerFormModal({
  customer,
  onClose,
  onSaved,
}: {
  customer?: Customer
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    type: customer?.type ?? ('osoba' as CustomerType),
    name: customer?.name ?? '',
    ico: customer?.ico ?? '',
    dic: customer?.dic ?? '',
    street: customer?.street ?? '',
    city: customer?.city ?? '',
    zip: customer?.zip ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    note: customer?.note ?? '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (customer) {
      await customersTable.update(customer.id, form)
    } else {
      await customersTable.insert({ id: newId(), createdAt: new Date().toISOString(), ...form })
    }
    setSaving(false)
    onSaved()
  }

  return (
    <Modal title={customer ? 'Upravit zákazníka' : 'Nový zákazník'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Typ">
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CustomerType })}
            >
              <option value="osoba">Fyzická osoba</option>
              <option value="firma">Firma</option>
            </Select>
          </FieldGroup>
          <FieldGroup label="Jméno / Název firmy">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FieldGroup>
        </div>

        {form.type === 'firma' && (
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="IČO">
              <Input value={form.ico} onChange={(e) => setForm({ ...form, ico: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="DIČ">
              <Input value={form.dic} onChange={(e) => setForm({ ...form, dic: e.target.value })} />
            </FieldGroup>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <FieldGroup label="Ulice a č.p.">
            <Input
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="Město">
            <Input
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="PSČ">
            <Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </FieldGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Telefon">
            <Input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="E-mail">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
