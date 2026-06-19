import { useState } from 'react'
import type { CustomerType, OrderPriority, OrderType } from '../types'
import { customersTable, newId, nextOrderNumber, ordersTable } from '../data/repository'
import { useAuth } from '../context/AuthContext'
import { Modal } from './ui/Modal'
import { FieldGroup, Input, Select, Textarea } from './ui/Field'
import { Button } from './ui/Button'
import { parseOrderEmail } from '../lib/emailImport'
import { orderPriorityLabels, orderTypeLabels } from '../lib/labels'

export function EmailImportModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth()
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState(false)
  const [parseError, setParseError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [orderType, setOrderType] = useState<OrderType>('oprava')
  const [priority, setPriority] = useState<OrderPriority>('normalni')
  const [form, setForm] = useState({
    customerType: 'osoba' as CustomerType,
    name: '',
    street: '',
    city: '',
    zip: '',
    phone: '',
    email: '',
    description: '',
  })

  function handleParse() {
    const result = parseOrderEmail(raw)
    if (!result) {
      setParseError(true)
      setParsed(false)
      return
    }
    setForm({ ...result, zip: '' })
    setParseError(false)
    setParsed(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    const customers = await customersTable.list()
    const existing = form.email
      ? customers.find((c) => c.email?.toLowerCase() === form.email.toLowerCase())
      : undefined

    let customerId = existing?.id
    if (!customerId) {
      customerId = newId()
      await customersTable.insert({
        id: customerId,
        createdAt: new Date().toISOString(),
        type: form.customerType,
        name: form.name,
        street: form.street,
        city: form.city,
        zip: form.zip,
        phone: form.phone,
        email: form.email || undefined,
        note: 'Vytvořeno automaticky z e-mailové objednávky.',
      })
    }

    const number = await nextOrderNumber()
    await ordersTable.insert({
      id: newId(),
      number,
      customerId,
      type: orderType,
      status: 'nova',
      priority,
      description: form.description,
      parts: [],
      laborPrice: 0,
      notes: [
        {
          id: newId(),
          authorId: user.id,
          text: 'Zakázka založena automatickým importem e-mailové objednávky.',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    })

    setSaving(false)
    onSaved()
  }

  return (
    <Modal title="Importovat objednávku z e-mailu" onClose={onClose} width="max-w-2xl">
      <div className="space-y-4">
        <FieldGroup label="Vložte text e-mailu s objednávkou">
          <Textarea
            rows={8}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={'Jméno a příjmení: …\nAdresa místa servisu: …\nEmail: …\nTelefon: …\n\nStručný popis závady:\n…'}
          />
        </FieldGroup>

        {!parsed && (
          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleParse} disabled={!raw.trim()}>
              Rozpoznat objednávku
            </Button>
            {parseError && (
              <p className="text-sm text-red-600">
                Nepodařilo se rozpoznat formát e-mailu. Zkontrolujte vložený text, nebo zákazníka a
                zakázku založte ručně.
              </p>
            )}
          </div>
        )}

        {parsed && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">
              Zkontrolujte rozpoznané údaje a doplňte chybějící (např. PSČ) před uložením.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Typ zákazníka">
                <Select
                  value={form.customerType}
                  onChange={(e) => setForm({ ...form, customerType: e.target.value as CustomerType })}
                >
                  <option value="osoba">Fyzická osoba</option>
                  <option value="firma">Firma</option>
                </Select>
              </FieldGroup>
              <FieldGroup label="Jméno / Název firmy">
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FieldGroup>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FieldGroup label="Ulice a č.p.">
                <Input
                  required
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup label="Město">
                <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </FieldGroup>
              <FieldGroup label="PSČ">
                <Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
              </FieldGroup>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Telefon">
                <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </FieldGroup>
              <FieldGroup label="E-mail">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </FieldGroup>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Typ zakázky">
                <Select value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)}>
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
            </div>

            <FieldGroup label="Popis závady / požadavku">
              <Textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </FieldGroup>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Zrušit
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Ukládání…' : 'Vytvořit zákazníka a zakázku'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
