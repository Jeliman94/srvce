// Parser for the fixed-format "Nová objednávka servisu" e-mails the website
// contact form sends. Staff paste the raw e-mail text into EmailImportModal;
// this extracts the labeled fields so a customer + order can be pre-filled
// instead of typed in by hand.

import type { CustomerType } from '../types'

export interface ParsedOrderEmail {
  name: string
  street: string
  city: string
  email: string
  phone: string
  description: string
  customerType: CustomerType
}

function singleLineField(text: string, label: string): string {
  return text.match(new RegExp(`${label}:[ \\t]*(.+)`))?.[1]?.trim() ?? ''
}

export function parseOrderEmail(raw: string): ParsedOrderEmail | null {
  const text = raw.replace(/\r\n/g, '\n')

  const name = singleLineField(text, 'Jméno a příjmení')
  const address = singleLineField(text, 'Adresa místa servisu')
  const email = singleLineField(text, 'Email')
  const phone = singleLineField(text, 'Telefon')

  const descMatch =
    text.match(/Stručný popis závady:\s*([\s\S]*?)\s*Fakturační údaje:/) ??
    text.match(/Stručný popis závady:\s*([\s\S]*)/)
  const description = descMatch?.[1]?.trim() ?? ''

  const billing = text.match(/Fakturační údaje:\s*\n?\s*(.+)/)?.[1]?.trim() ?? ''

  if (!name || !description) return null

  const [street = '', city = ''] = address.split(',').map((part) => part.trim())

  return {
    name,
    street,
    city,
    email,
    phone,
    description,
    customerType: /firma/i.test(billing) ? 'firma' : 'osoba',
  }
}
