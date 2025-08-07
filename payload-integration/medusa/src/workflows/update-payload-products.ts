import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { PayloadUpsertData } from "../modules/payload/types";
import { updatePayloadItemsStep } from "./steps/update-payload-items";

type WorkflowInput = {
  product_ids: string[]
}

export const updatePayloadProductsWorkflow = createWorkflow(
  "update-payload-products",
  (input: WorkflowInput) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "subtitle", 
        "description",
        "updated_at",
        "payload_product.*"
      ],
      filters: {
        id: input.product_ids,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const updateData = transform({
      products
    }, (data) => {
      const items: PayloadUpsertData[] = []

      data.products.forEach(product => {
        // @ts-expect-error
        const payloadProduct = product.payload_product
        if (!payloadProduct) return

        items.push({
          id: payloadProduct.id,
          updatedAt: product.updated_at as string,
          title: product.title,
          handle: product.handle,
          subtitle: product.subtitle,
          description: product.description || "",
        })
      })

      return {
        collection: "products",
        items
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
