import { InferTypeOf } from "@medusajs/types"
import Subscription from "../models/subscription"

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

export type SubscriptionData = InferTypeOf<typeof Subscription>