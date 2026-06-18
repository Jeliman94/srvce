import type { OrderPriority, OrderStatus } from '../types'
import { orderPriorityColors, orderPriorityLabels, orderStatusColors, orderStatusLabels } from '../lib/labels'
import { Badge } from './ui/Badge'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={orderStatusColors[status]}>{orderStatusLabels[status]}</Badge>
}

export function OrderPriorityBadge({ priority }: { priority: OrderPriority }) {
  return <Badge className={orderPriorityColors[priority]}>{orderPriorityLabels[priority]}</Badge>
}
