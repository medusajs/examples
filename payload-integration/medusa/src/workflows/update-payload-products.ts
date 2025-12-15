import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { updateProductsWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { retrievePayloadItemsStep } from "./steps/retrieve-payload-items";
import { createPayloadItemsStep } from "./steps/create-payload-items";
import { updatePayloadItemsStep } from "./steps/update-payload-items";
import { PayloadCollectionItem, PayloadUpsertData } from "../modules/payload/types";
import { createPayloadProductOptionsWorkflow } from "./create-payload-product-options";

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
        "options.id",
        "options.title",
        "options.values.id",
        "options.values.value",
        "metadata.payload_id",
      ],
      filters: {
        id: input.product_ids,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })
    
    // Check which options already exist in Payload
    const retrieveOptionsData = transform({
      products
    }, (data) => {
      const optionIds = new Set<string>()
      data.products.forEach((product) => {
        product.options.forEach((option) => {
          optionIds.add(option.id)
        })
      })
      return {
        collection: "product-options",
        where: {
          medusa_id: {
            in: Array.from(optionIds).join(",")
          }
        }
      }
    })

    const { items: existingOptions } = retrievePayloadItemsStep(retrieveOptionsData)

    // Create missing options
    const optionsToCreate = transform({
      products,
      existingOptions
    }, (data) => {
      const existingMedusaIds = new Set(
        (data.existingOptions || []).map((o) => o.medusa_id)
      )

      const optionsToCreate: Set<string> = new Set()
      data.products.forEach((product) => {
        product.options.forEach((option) => {
          if (!existingMedusaIds.has(option.id)) {
            optionsToCreate.add(option.id)
          }
        })
      })

      return Array.from(optionsToCreate)
    })

    const createdOptionsResult = when({ optionsToCreate }, (data) => data.optionsToCreate.length > 0)
      .then(() => {
        return createPayloadProductOptionsWorkflow.runAsStep({
          input: {
            option_ids: optionsToCreate
          }
        })
      })

    // Combine existing and created options
    const allPayloadOptions = transform({
      existingOptions,
      createdOptionsResult
    }, (data) => {
      return [
        ...(data.existingOptions || []),
        ...(data.createdOptionsResult?.items || [])
      ]
    })

    // Update products with option references
    const updateData = transform({
      products,
      allPayloadOptions
    }, (data) => {
      const optionMap = new Map<string, string>()
      data.allPayloadOptions.forEach((option: any) => {
        optionMap.set(option.medusa_id, option.id)
      })

      const items = data.products
        .map((product) => {
          const payloadProductId = product.metadata?.payload_id
          if (!payloadProductId) return null

          const productOptionIds = (product.options || [])
            .map((option) => optionMap.get(option.id))
            .filter(Boolean) as string[]

          return {
            id: payloadProductId,
            options: productOptionIds,
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
      
      return {
        collection: "products",
        items: items as PayloadUpsertData[],
      }
    })

    const { items: updatedProducts } = updatePayloadItemsStep(updateData)

    return new WorkflowResponse({
      items: updatedProducts
    })
  }
)

