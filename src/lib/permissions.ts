import type { Role, User } from '../types'

type Action =
  | 'manageUsers'
  | 'manageCustomers'
  | 'manageDevices'
  | 'createOrder'
  | 'scheduleOrder'
  | 'deleteOrder'

const rules: Record<Action, Role[]> = {
  manageUsers: ['admin'],
  manageCustomers: ['admin'],
  manageDevices: ['admin'],
  createOrder: ['admin'],
  scheduleOrder: ['admin'],
  deleteOrder: ['admin'],
}

export function can(user: User | null, action: Action): boolean {
  if (!user) return false
  return rules[action].includes(user.role)
}

// Any technik can work on any order (arrival/departure time, material, status) —
// only scheduling (who + when) is restricted to admin via scheduleOrder.
export function canEditOrder(user: User | null): boolean {
  if (!user) return false
  return user.role === 'admin' || user.role === 'technik'
}

export const roleLabels: Record<Role, string> = {
  admin: 'Administrátor',
  technik: 'Technik',
  fakturace: 'Fakturace',
}
