import { LocalTable } from '../lib/localTable'
import type { Customer, Device, ServiceOrder, User } from '../types'
import { seedCustomers, seedDevices, seedOrders, seedUsers } from './seed'

export const usersTable = new LocalTable<User>('users', seedUsers)
export const customersTable = new LocalTable<Customer>('customers', seedCustomers)
export const devicesTable = new LocalTable<Device>('devices', seedDevices)
export const ordersTable = new LocalTable<ServiceOrder>('orders', seedOrders)

export function resetDemoData() {
  usersTable.reset(seedUsers)
  customersTable.reset(seedCustomers)
  devicesTable.reset(seedDevices)
  ordersTable.reset(seedOrders)
}

export function newId(): string {
  return crypto.randomUUID()
}

export async function nextOrderNumber(): Promise<string> {
  const orders = await ordersTable.list()
  const year = new Date().getFullYear()
  const seq = orders.filter((o) => o.number.includes(String(year))).length + 1
  return `ZAK-${year}-${String(seq).padStart(4, '0')}`
}
