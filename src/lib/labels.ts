import type { OrderPriority, OrderStatus, OrderType } from '../types'

export const orderStatusLabels: Record<OrderStatus, string> = {
  nova: 'Nová',
  naplanovana: 'Naplánovaná',
  ceka_na_dily: 'Čeká na díly',
  hotovo: 'Hotovo',
  zrusena: 'Zrušená',
}

export const orderStatusOrder: OrderStatus[] = ['nova', 'naplanovana', 'ceka_na_dily', 'hotovo']

export const orderStatusColors: Record<OrderStatus, string> = {
  nova: 'bg-slate-100 text-slate-700 ring-slate-300',
  naplanovana: 'bg-blue-50 text-blue-700 ring-blue-300',
  ceka_na_dily: 'bg-purple-50 text-purple-700 ring-purple-300',
  hotovo: 'bg-emerald-50 text-emerald-700 ring-emerald-300',
  zrusena: 'bg-rose-50 text-rose-700 ring-rose-300',
}

export const orderTypeLabels: Record<OrderType, string> = {
  oprava: 'Oprava',
  servis: 'Servis',
  instalace: 'Instalace',
  revize: 'Revize',
}

export const orderPriorityLabels: Record<OrderPriority, string> = {
  nizka: 'Nízká',
  normalni: 'Normální',
  vysoka: 'Vysoká',
  havarie: 'Havárie',
}

export const orderPriorityColors: Record<OrderPriority, string> = {
  nizka: 'bg-slate-100 text-slate-600 ring-slate-300',
  normalni: 'bg-blue-50 text-blue-700 ring-blue-300',
  vysoka: 'bg-orange-50 text-orange-700 ring-orange-300',
  havarie: 'bg-red-100 text-red-700 ring-red-400',
}
