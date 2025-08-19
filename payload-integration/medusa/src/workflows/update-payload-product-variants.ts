import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { PayloadCollectionItem, PayloadUpsertData } from "../modules/payload/types";
import { updatePayloadItemsStep } from "./steps/update-payload-items";

type WorkflowInput = {
  variant_ids: string[]; 
}

export const updatePayloadProductVariantsWorkflow = createWorkflow(
  "update-payload-product-variants",
  ({ variant_ids }: WorkflowInput) => {
    const { data: productVariants } = useQueryGraphStep({
      entity: "product_variant",
      fields: [
        "id",
        "title",
        "options.*",
        "options.option.*",
        "product.payload_product.*"
      ],
      filters: {
        id: variant_ids,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const updateData = transform({
      productVariants
    }, (data) => {
      const items: Record<string, PayloadUpsertData> = {}

      data.productVariants.forEach((variant) => {
        // @ts-expect-error
        const payloadProduct = variant.product?.payload_product as PayloadCollectionItem
        if (!payloadProduct) return
        
        if (!items[payloadProduct.id]) {
          items[payloadProduct.id] = {
            variants: payloadProduct.variants || [],
          }
        }

        // Find and update the existing variant in the payload product
        const existingVariantIndex = items[payloadProduct.id].variants.findIndex(
          (v: any) => v.medusa_id === variant.id
        )

        if (existingVariantIndex >= 0) {
          // check if option values need to be updated
          const existingVariant = items[payloadProduct.id].variants[existingVariantIndex];
          const updatedOptionValues = variant.options.map((option) => ({
            medusa_id: option.id,
            medusa_option_id: option.option?.id,
            value: existingVariant.option_values.find((ov: any) => ov.medusa_id === option.id)?.value || 
              option.value,
          }))

          items[payloadProduct.id].variants[existingVariantIndex] = {
            ...existingVariant,
            option_values: updatedOptionValues,
          }
        } else {
          // Add the new variant to the payload product
          items[payloadProduct.id].variants.push({
            title: variant.title,
            medusa_id: variant.id,
            option_values: variant.options.map((option) => ({
              medusa_id: option.id,
              medusa_option_id: option.option?.id,
              value: option.value,
            })),
          })
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
