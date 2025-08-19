import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updatePayloadItemsStep } from "./steps/update-payload-items";
import { retrievePayloadItemsStep } from "./steps/retrieve-payload-items";

type WorkflowInput = {
  variant_ids: string[]
}

export const deletePayloadProductVariantsWorkflow = createWorkflow(
  "delete-payload-product-variants",
  ({ variant_ids }: WorkflowInput) => {
    const retrieveData = transform({
      variant_ids
    }, (data) => {
      return {
        collection: "products",
        where: {
          "variants.medusa_id": {
            in: data.variant_ids.join(",")
          }
        }
      }
    })

    const { items: payloadProducts } = retrievePayloadItemsStep(retrieveData)

    const updateData = transform({
      payloadProducts,
      variant_ids
    }, (data) => {
      const items = data.payloadProducts.map((payloadProduct) => ({
        id: payloadProduct.id,
        variants: payloadProduct.variants.filter((v: any) => !data.variant_ids.includes(v.medusa_id)),
      }))
      
      return {
        collection: "products",
        items,
      }
    })

    const result = when({ updateData }, (data) => data.updateData.items.length > 0)
      .then(() => {
        // Call the step to update the payload items
        return updatePayloadItemsStep(updateData)
      })

    const items = transform({ result }, (data) => data.result?.items || [])

    return new WorkflowResponse({
      items
    })
  }
)
