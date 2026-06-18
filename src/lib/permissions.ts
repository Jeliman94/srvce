import type { PermissionAction, Role, User } from '../types'

export const permissionActions: PermissionAction[] = [
  'manageUsers',
  'manageCustomers',
  'createOrder',
  'scheduleOrder',
  'deleteOrder',
  'editOrder',
]

export const actionLabels: Record<PermissionAction, string> = {
  manageUsers: 'Správa uživatelů',
  manageCustomers: 'Správa zákazníků',
  createOrder: 'Vytváření zakázek',
  scheduleOrder: 'Plánování zakázek (technik a termín)',
  deleteOrder: 'Mazání zakázek',
  editOrder: 'Úprava zakázek (stav, materiál, časy)',
}

// Default permissions by role — used unless a user has an explicit override.
const defaultRules: Record<PermissionAction, Role[]> = {
  manageUsers: ['admin'],
  manageCustomers: ['admin'],
  createOrder: ['admin'],
  scheduleOrder: ['admin'],
  deleteOrder: ['admin'],
  editOrder: ['admin', 'technik'],
}

export function defaultCan(role: Role, action: PermissionAction): boolean {
  return defaultRules[action].includes(role)
}

export function can(user: User | null, action: PermissionAction): boolean {
  if (!user) return false
  const override = user.permissionOverrides?.[action]
  if (override !== undefined) return override
  return defaultCan(user.role, action)
}

export function canEditOrder(user: User | null): boolean {
  return can(user, 'editOrder')
}

export const roleLabels: Record<Role, string> = {
  admin: 'Administrátor',
  technik: 'Technik',
  fakturace: 'Fakturace',
}
