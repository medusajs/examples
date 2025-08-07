import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updatePayloadItemsStep } from "./steps/update-payload-items";
import { retrievePayloadItemsStep } from "./steps/retrieve-payload-items";

type WorkflowInput = {
  option_ids: string[]
}

export const deletePayloadProductOptionsWorkflow = createWorkflow(
  "delete-payload-product-options",
  ({ option_ids }: WorkflowInput) => {
    const retrieveData = transform({
      option_ids
    }, (data) => {
      return {
        collection: "products",
        where: {
          "options.medusa_id": {
            in: data.option_ids.join(",")
          }
        }
      }
    })

    const { items: payloadProducts } = retrievePayloadItemsStep(retrieveData)

    const updateData = transform({
      payloadProducts,
      option_ids
    }, (data) => {
      const items = data.payloadProducts.map((payloadProducts) => ({
        id: payloadProducts.id,
        options: payloadProducts.options.filter((o: any) => !data.option_ids.includes(o.medusa_id)),
        variants: payloadProducts.variants.map((variant: any) => ({
          ...variant,
          option_values: variant.option_values.filter((ov: any) => !data.option_ids.includes(ov.medusa_option_id))
        }))
      }))
      
      return {
        collection: "products",
        items,
      }
    })

    const result = when({ updateData }, (data) => data.updateData.items.length > 0)
      .then(() => {
        return updatePayloadItemsStep(updateData)
      })

    const items = transform({ result }, (data) => data.result?.items || [])

    return new WorkflowResponse({
      items
    })
  }
)
