import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/medusa"
import { 
  ContainerRegistrationKeys,
  MedusaError
} from "@medusajs/utils"
import createSubscriptionWorkflow from "../../../../../workflows/create-subscription"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [cart] } = await query.graph({
    entity: "cart",
    fields: [
      "metadata"
    ],
    filters: {
      id: [req.params.id]
    }
  })
  
  const { metadata } = cart

  if (!metadata?.subscription_interval || !metadata.subscription_period) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Please set the subscription's interval and period first."
    )
  }

  const { result } = await createSubscriptionWorkflow(
    req.scope
  ).run({
    input: {
      cart_id: req.params.id,
      subscription_data: {
        interval: metadata.subscription_interval,
        period: metadata.subscription_period
      }
    }
  })

  res.json({
    type: "order",
    ...result
  })
}