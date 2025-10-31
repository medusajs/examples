import { QueryContext } from "@medusajs/framework/utils"
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { getCustomPriceStep, GetCustomPriceStepInput } from "./steps/get-custom-price"

type WorkflowInput = {
  variant_id: string
  region_id: string
  metadata?: Record<string, unknown>
}

export const getCustomPriceWorkflow = createWorkflow(
  "get-custom-price-workflow",
  (input: WorkflowInput) => {
    const { data: regions } = useQueryGraphStep({
      entity: "region",
      fields: ["currency_code"],
      filters: {
        id: input.region_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })
    const { data: variants } = useQueryGraphStep({
      entity: "variant",
      fields: [
        "*",
        "calculated_price.*",
        "product.*"
      ],
      filters: {
        id: input.variant_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
      context: {
        calculated_price: QueryContext({
          currency_code: regions[0].currency_code,
        }),
      },
    }).config({ name: "get-custom-price-variant" })

    const price = getCustomPriceStep({
      variant: variants[0],
      metadata: input.metadata,
    } as unknown as GetCustomPriceStepInput)

    return new WorkflowResponse(price)
  }
)