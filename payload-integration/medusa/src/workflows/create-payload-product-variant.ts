import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { PayloadCollectionItem, PayloadUpsertData } from "../modules/payload/types";
import { retrievePayloadItemsStep } from "./steps/retrieve-payload-items";
import { updatePayloadItemsStep } from "./steps/update-payload-items";

type WorkflowInput = {
  variant_ids: string[]; 
}

export const createPayloadProductVariantWorkflow = createWorkflow(
  "create-payload-product-variant",
  ({ variant_ids }: WorkflowInput) => {
    const { data: productVariants } = useQueryGraphStep({
      entity: "product_variant",
      fields: [
        "id",
        "title",
        "options.id",
        "options.option.id",
        "product.payload_product.*"
      ],
      filters: {
        id: variant_ids,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    // Retrieve existing option values
    const retrieveValuesData = transform({
      productVariants
    }, (data) => {
      const valueIds = new Set<string>()
      data.productVariants.forEach((variant) => {
        variant.options.forEach((opt) => valueIds.add(opt.id))
      })
      return {
        collection: "option-values",
        where: { 
          medusa_id: { 
            in: Array.from(valueIds).join(",")
          }
        }
      }
    })

    const { items: existingValues } = retrievePayloadItemsStep(retrieveValuesData)

    const updateData = transform({
      productVariants,
      existingValues
    }, (data) => {
      const valuesMap = new Map<string, string>()
      ;(data.existingValues || []).forEach((v) => {
        valuesMap.set(v.medusa_id, v.id)
      })

      const items: Record<string, PayloadUpsertData> = {}
      data.productVariants.forEach((variant) => {
        const payloadProduct = (variant.product as any)?.payload_product as PayloadCollectionItem
        if (!payloadProduct) return
        
        if (!items[payloadProduct.id]) {
          items[payloadProduct.id] = {
            variants: payloadProduct.variants || [],
          }
        }

        const optionValueIds = (variant.options || [])
          .map((opt) => valuesMap.get(opt.id))
          .filter(Boolean) as string[]

        items[payloadProduct.id].variants.push({
          title: variant.title,
          medusa_id: variant.id,
          option_values: optionValueIds,
        })
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