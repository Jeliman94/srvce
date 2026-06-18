import { useCallback, useEffect, useState } from 'react'
import { customersTable, devicesTable, ordersTable, usersTable } from '../data/repository'
import type { Customer, Device, ServiceOrder, User } from '../types'
import { deviceTypeLabels } from '../lib/labels'

interface EntitiesState {
  users: User[]
  customers: Customer[]
  devices: Device[]
  orders: ServiceOrder[]
  loading: boolean
}

export function useEntities() {
  const [state, setState] = useState<EntitiesState>({
    users: [],
    customers: [],
    devices: [],
    orders: [],
    loading: true,
  })

  const reload = useCallback(async () => {
    const [users, customers, devices, orders] = await Promise.all([
      usersTable.list(),
      customersTable.list(),
      devicesTable.list(),
      ordersTable.list(),
    ])
    setState({ users, customers, devices, orders, loading: false })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  function customerName(id?: string): string {
    if (!id) return '—'
    return state.customers.find((c) => c.id === id)?.name ?? '—'
  }

  function technicianName(id?: string): string {
    if (!id) return 'Nepřiřazeno'
    return state.users.find((u) => u.id === id)?.name ?? '—'
  }

  function deviceLabel(id?: string): string {
    if (!id) return '—'
    const device = state.devices.find((d) => d.id === id)
    if (!device) return '—'
    return `${deviceTypeLabels[device.type]} – ${device.manufacturer} ${device.model}`
  }

  return { ...state, reload, customerName, technicianName, deviceLabel }
}
