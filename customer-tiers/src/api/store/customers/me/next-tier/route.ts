import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { TIER_MODULE } from "../../../../../modules/tier"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import { OrderStatus } from "@medusajs/framework/utils"

export const NextTierSchema = z.object({
  region_id: z.string(),
})

type NextTierInput = z.infer<typeof NextTierSchema>

export async function GET(
  req: AuthenticatedMedusaRequest<{}, NextTierInput>,
  res: MedusaResponse
): Promise<void> {
  // Validate customer is authenticated
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Customer must be authenticated"
    )
  }

  const query = req.scope.resolve("query")
  const tierModuleService = req.scope.resolve(TIER_MODULE)

  // Get customer details to validate they're registered
  const { data: [customer] } = await query.graph({
    entity: "customer",
    fields: ["id", "has_account", "tier.*"],
    filters: {
      id: customerId,
    },
  }, {
    throwIfKeyNotFound: true,
  })

  if (!customer.has_account) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Customer must be registered to view tier information"
    )
  }

  // Get currency code from cart or region context
  // Try to get from cart first, then region
  let regionId = req.validatedQuery.region_id

  // Calculate total purchase value
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "total", "currency_code"],
    filters: {
      customer_id: customerId,
      region_id: regionId,
      status: {
        $nin: [
          OrderStatus.CANCELED,
          OrderStatus.DRAFT,
        ]
      },
    },
  })

  // Get currency code from region if no orders
  let currencyCode: string | null = null
  if (orders.length > 0) {
    currencyCode = orders[0].currency_code
  } else {
    // Get currency from region
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
      filters: {
        id: regionId,
      },
    })
    
    if (regions && regions.length > 0) {
      currencyCode = regions[0].currency_code
    }
  }

  const totalPurchaseValue = orders.length > 0
    ? orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
    : 0

  // Current tier is always the customer's assigned tier (null if not assigned)
  const currentTier = customer.tier || null

  // Determine next tier upgrade
  let nextTierUpgrade = await tierModuleService.calculateNextTierUpgrade(
    currencyCode as string,
    totalPurchaseValue
  )

  res.json({
    current_tier: currentTier,
    current_purchase_value: totalPurchaseValue,
    currency_code: currencyCode,
    next_tier_upgrade: nextTierUpgrade,
  })
}

