import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { PayloadCollectionItem, PayloadUpsertData } from "../modules/payload/types";
import { updatePayloadItemsStep } from "./steps/update-payload-items";

type WorkflowInput = {
  option_ids: string[]; 
}

export const createPayloadProductOptionsWorkflow = createWorkflow(
  "create-payload-product-options",
  ({ option_ids }: WorkflowInput) => {
    const { data: productOptions } = useQueryGraphStep({
      entity: "product_option",
      fields: [
        "id",
        "title",
        "product.payload_product.*"
      ],
      filters: {
        id: option_ids,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const updateData = transform({
      productOptions
    }, (data) => {
      const items: Record<string, PayloadUpsertData> = {}

      data.productOptions.forEach((option) => {
        // @ts-expect-error
        const payloadProduct = option.product?.payload_product as PayloadCollectionItem
        if (!payloadProduct) return
        
        if (!items[payloadProduct.id]) {
          items[payloadProduct.id] = {
            options: payloadProduct.options || [],
          }
        }

        // Add the new option to the payload product
        const newOption = {
          title: option.title,
          medusa_id: option.id,
        }

        // Check if option already exists, if not add it
        const existingOptionIndex = items[payloadProduct.id].options.findIndex(
          (o: any) => o.medusa_id === option.id
        )
        
        if (existingOptionIndex === -1) {
          items[payloadProduct.id].options.push(newOption)
        }
      })
      
      return {
        collection: "products",
        items: Object.keys(items).map((id) => ({
          id,
          ...items[id],
        })),
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
