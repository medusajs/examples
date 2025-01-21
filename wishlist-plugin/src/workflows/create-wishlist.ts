import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { validateCustomerCreateWishlistStep } from "./steps/validate-customer-create-wishlist"
import { createWishlistStep } from "./steps/create-wishlist"
import { WISHLIST_MODULE } from "../modules/wishlist"
import { Modules } from "@medusajs/framework/utils"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { LinkDefinition } from "@medusajs/framework/types"

type CreateWishlistWorkflowInput = {
  customer_id: string
  sales_channel_id: string
}

export const createWishlistWorkflow = createWorkflow(
  "create-wishlist",
  (input: CreateWishlistWorkflowInput) => {
    validateCustomerCreateWishlistStep({
      customer_id: input.customer_id
    })

    const wishlist = createWishlistStep(input)

    const linkDefs = transform({
      input,
      wishlist
    }, (data) => {
      return [
        {
          [WISHLIST_MODULE]: {
            wishlist_id: data.wishlist.id
          },
          [Modules.CUSTOMER]: {
            customer_id: data.input.customer_id
          }
        },
        {
          [WISHLIST_MODULE]: {
            wishlist_id: data.wishlist.id
          },
          [Modules.SALES_CHANNEL]: {
            sales_channel_id: data.input.sales_channel_id
          }
        }
      ] as LinkDefinition[]
    })

    createRemoteLinkStep(linkDefs)

    return new WorkflowResponse({
      wishlist
    })
  }
)