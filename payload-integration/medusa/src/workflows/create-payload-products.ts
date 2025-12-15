import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createPayloadItemsStep } from "./steps/create-payload-items";
import { updateProductsWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { retrievePayloadItemsStep } from "./steps/retrieve-payload-items";
import { createPayloadProductOptionsWorkflow } from "./create-payload-product-options";
import { PayloadCollectionItem } from "../modules/payload/types";

type WorkflowInput = {
  product_ids: string[]
}

export const createPayloadProductsWorkflow = createWorkflow(
  "create-payload-products",
  (input: WorkflowInput) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "subtitle",
        "description",
        "created_at",
        "updated_at",
        "options.id",
        "options.title",
        "options.values.id",
        "options.values.value",
        "variants.title",
        "variants.id",
        "variants.options.id",
        "variants.options.option.id",
        "variants.options.option.value",
        "thumbnail"
      ],
      filters: {
        id: input.product_ids,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    // Check which options already exist in Payload
    const {
      retrieve_data: retrieveOptionsData,
      option_ids: allOptionIds
    } = transform({
      products
    }, (data) => {
      const optionIds = new Set<string>()
      data.products.forEach((product) => {
        product.options.forEach((option) => {
          if (option.id) {
            optionIds.add(option.id)
          }
        })
      })
      const allOptionIds = Array.from(optionIds)
      return {
        retrieve_data: {
          collection: "product-options",
          where: {
            medusa_id: {
              in: allOptionIds.join(",")
            }
          }
        },
        option_ids: allOptionIds
      }
    })

    const { items: existingOptions } = retrievePayloadItemsStep(retrieveOptionsData)

    // Create missing options
    const createOptionIds = transform({
      allOptionIds,
      existingOptions
    }, (data) => {
      const existingMedusaIds = new Set(
        (data.existingOptions || []).map((o) => o.medusa_id)
      )

      const optionIdsToCreate = data.allOptionIds.filter(
        (optionId: string) => !existingMedusaIds.has(optionId)
      )

      return optionIdsToCreate
    })

    const createdOptionsResult = when({ createOptionIds }, (data) => data.createOptionIds.length > 0)
      .then(() => {
        return createPayloadProductOptionsWorkflow.runAsStep({
          input: {
            option_ids: createOptionIds
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

    // Retrieve existing option values and create products
    const retrieveValuesData = transform({
      products
    }, (data) => {
      const valueIds = new Set<string>()
      data.products.forEach((product) => {
        product.variants.forEach((variant) => {
          variant.options.forEach((opt) => {
            valueIds.add(opt.id)
          })
        })
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
      .config({ name: "retrieve-payload-option-values" })

    // Create products with option references
    const createData = transform({
      products,
      allPayloadOptions,
      existingValues
    }, (data) => {
      const optionMap = new Map<string, PayloadCollectionItem>()
      data.allPayloadOptions.forEach((option) => {
        optionMap.set(option.medusa_id, option)
      })

      const valuesMap = new Map<string, string>()
      ;(data.existingValues || []).forEach((v) => {
        valuesMap.set(v.medusa_id, v.id)
      })

      return {
        collection: "products",
        items: data.products.map((product) => {
          const productOptionIds = (product.options || [])
            .map((option) => optionMap.get(option.id)?.id)
            .filter(Boolean) as string[]

          return {
            medusa_id: product.id,
            createdAt: product.created_at as string,
            updatedAt: product.updated_at as string,
            title: product.title,
            subtitle: product.subtitle,
            description: product.description || "",
            options: productOptionIds,
            variants: product.variants.map((variant) => {
              const optionValueIds = (variant.options || [])
                .map((opt) => valuesMap.get(opt.id))
                .filter(Boolean) as string[]

              return {
                title: variant.title,
                medusa_id: variant.id,
                option_values: optionValueIds,
              }
            }),
          }
        })
      }
    })

    const { items: createdProducts } = createPayloadItemsStep(
      createData
    )

    // Store payload_id in metadata
    const updateData = transform({
      createdProducts
    }, (data) => {
      return data.createdProducts.map((item) => ({
        id: item.medusa_id,
        metadata: {
          payload_id: item.id,
        }
      }))
    })

    updateProductsWorkflow.runAsStep({
      input: {
        products: updateData
      }
    })

    return new WorkflowResponse({
      items: createdProducts
    })
  }
)