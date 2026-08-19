import { 
  createWorkflow, 
  WorkflowResponse,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { UpdateProductInStrapiInput, updateProductInStrapiStep } from "./steps/update-product-in-strapi"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createProductInStrapiWorkflow } from "./create-product-in-strapi"
import { createOptionsInStrapiWorkflow } from "./create-options-in-strapi"
import { retrieveFromStrapiStep } from "./steps/retrieve-from-strapi"
import { Collection } from "../modules/strapi/service"

export type UpdateProductInStrapiWorkflowInput = {
  id: string
}

export const updateProductInStrapiWorkflow = createWorkflow(
  "update-product-in-strapi",
  (input: UpdateProductInStrapiWorkflowInput) => {
    // Fetch the product with all necessary fields including metadata and options
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "title",
        "subtitle",
        "description",
        "handle",
        "metadata",
        "options.id",
      ],
      filters: {
        id: input.id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })
    const optionIds = transform({ products }, (data) => {
      return data.products[0].options.map((option) => option.id)
    })

    // Retrieve existing options from Strapi
    const existingStrapiOptions = retrieveFromStrapiStep({
      collection: Collection.PRODUCT_OPTIONS,
      ids: optionIds,
    })

    // Calculate which options need to be created
    const optionsToCreate = transform({ existingStrapiOptions, optionIds }, (data) => {
      const existingMedusaIds = new Set(data.existingStrapiOptions.map((option) => option.medusaId))
      return data.optionIds.filter((id) => !existingMedusaIds.has(id))
    })

    // Create missing options (returns undefined if no options to create)
    const newStrapiOptions = when({ optionsToCreate }, (data) => data.optionsToCreate.length > 0).then(() => {
      return createOptionsInStrapiWorkflow.runAsStep({
        input: {
          ids: optionsToCreate,
        }
      })
    })

    const strapiOptionIds = transform({ existingStrapiOptions, newStrapiOptions }, (data) => {
      const existingIds = (data.existingStrapiOptions || []).map((option) => option.id).filter(Boolean) as number[]
      const newIds = data.newStrapiOptions ? (data.newStrapiOptions.strapi_options || []).map((option) => option.id).filter(Boolean) as number[] : []
      return [...existingIds, ...newIds]
    })

    // If product doesn't exist in Strapi, create it
    const createResult = when({ products }, (data) => !data.products[0].metadata?.strapi_id).then(() => {
      return createProductInStrapiWorkflow.runAsStep({
        input: {
          id: input.id,
        }
      })
    })

    const updateResult = when({ products }, (data) => !!data.products[0].metadata?.strapi_id).then(() => {
      // Combine existing and newly created options
      const updateData = transform({ strapiOptionIds, products }, (data) => {
        return {
          id: data.products[0].id,
          optionIds: data.strapiOptionIds,
          title: data.products[0].title,
          subtitle: data.products[0].subtitle,
          description: data.products[0].description,
          handle: data.products[0].handle,
        }
      })
      // Try to update the product in Strapi
      const updated = updateProductInStrapiStep({
        product: updateData,
      } as UpdateProductInStrapiInput)

      return updated
    })

    const result = transform({
      createResult,
      updateResult,
    }, (data) => {
      return data.createResult || data.updateResult
    })

    return new WorkflowResponse(result)
  }
)

