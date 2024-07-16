export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  EXPIRED = "expired",
  FAILED = "failed"
}

export enum SubscriptionInterval {
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

export type CreateSubscriptionData = {
  interval: SubscriptionInterval
  period: number
  status?: SubscriptionStatus
  subscription_date?: Date
  metadata?: Record<string, unknown>
}

export type SubscriptionData = {
  id: string
  status: SubscriptionStatus
  interval: SubscriptionInterval
  subscription_date: Date
  last_order_date: Date
  next_order_date: Date | null
  expiration_date: Date
  metadata: Record<string, unknown> | null
}