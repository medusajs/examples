import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { PostStoreCreateRestockSubscription } from "./validators"
import { MedusaError } from "@medusajs/framework/utils"
import { createRestockSubscriptionWorkflow } from "../../../workflows/create-restock-subscription"

type PostStoreCreateRestockSubscription = z.infer<
  typeof PostStoreCreateRestockSubscription
>

export async function POST(
  req: AuthenticatedMedusaRequest<PostStoreCreateRestockSubscription>,
  res: MedusaResponse
) {
  const { result } = await createRestockSubscriptionWorkflow(req.scope)
    .run({
      input: {
        variant_id: req.validatedBody.variant_id,
        sales_channel_ids: req.publishable_key_context?.sales_channel_ids || [],
        customer: {
          email: req.validatedBody.email,
          customer_id: req.auth_context?.actor_id
        }
      }
    })

  return res.sendStatus(201)
}
