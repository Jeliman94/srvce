import type { Role, ServiceOrder, User } from '../types'

type Action =
  | 'manageUsers'
  | 'manageCustomers'
  | 'manageDevices'
  | 'createOrder'
  | 'assignTechnician'
  | 'deleteOrder'

const rules: Record<Action, Role[]> = {
  manageUsers: ['admin'],
  manageCustomers: ['admin', 'recepce'],
  manageDevices: ['admin', 'recepce'],
  createOrder: ['admin', 'recepce'],
  assignTechnician: ['admin', 'recepce'],
  deleteOrder: ['admin'],
}

export function can(user: User | null, action: Action): boolean {
  if (!user) return false
  return rules[action].includes(user.role)
}

export function canEditOrder(user: User | null, order: ServiceOrder): boolean {
  if (!user) return false
  if (user.role === 'admin' || user.role === 'recepce') return true
  return user.role === 'technik' && order.assignedTechnicianId === user.id
}

export const roleLabels: Record<Role, string> = {
  admin: 'Administrátor',
  technik: 'Technik',
  recepce: 'Recepce',
}
