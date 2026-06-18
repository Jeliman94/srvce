export type Role = 'admin' | 'technik' | 'fakturace'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
  active: boolean
  createdAt: string
}

export type CustomerType = 'firma' | 'osoba'

export interface Customer {
  id: string
  type: CustomerType
  name: string
  ico?: string
  dic?: string
  street: string
  city: string
  zip: string
  phone: string
  email?: string
  note?: string
  createdAt: string
}

export type OrderType = 'oprava' | 'servis' | 'instalace' | 'revize'

export type OrderStatus =
  | 'nova'
  | 'naplanovana'
  | 'ceka_na_dily'
  | 'hotovo'
  | 'zrusena'

export type OrderPriority = 'nizka' | 'normalni' | 'vysoka' | 'havarie'

export interface OrderPart {
  id: string
  name: string
  qty: number
  unitPrice: number
}

export interface OrderNote {
  id: string
  authorId: string
  text: string
  createdAt: string
}

export interface ServiceOrder {
  id: string
  number: string
  customerId: string
  type: OrderType
  status: OrderStatus
  priority: OrderPriority
  description: string
  assignedTechnicianId?: string
  scheduledAt?: string
  workStartedAt?: string
  workEndedAt?: string
  completedAt?: string
  parts: OrderPart[]
  laborPrice: number
  notes: OrderNote[]
  createdAt: string
  createdBy: string
}
