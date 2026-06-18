import { useCallback, useEffect, useState } from 'react'
import { customersTable, ordersTable, usersTable } from '../data/repository'
import type { Customer, ServiceOrder, User } from '../types'

interface EntitiesState {
  users: User[]
  customers: Customer[]
  orders: ServiceOrder[]
  loading: boolean
}

export function useEntities() {
  const [state, setState] = useState<EntitiesState>({
    users: [],
    customers: [],
    orders: [],
    loading: true,
  })

  const reload = useCallback(async () => {
    const [users, customers, orders] = await Promise.all([
      usersTable.list(),
      customersTable.list(),
      ordersTable.list(),
    ])
    setState({ users, customers, orders, loading: false })
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

  return { ...state, reload, customerName, technicianName }
}
