import { 
  createWorkflow, 
  WorkflowResponse,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { updateOptionInStrapiStep } from "./steps/update-option-in-strapi"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createOptionsInStrapiWorkflow } from "./create-options-in-strapi"
import { createOptionValuesInStrapiStep } from "./steps/create-option-values-in-strapi"
import { updateProductOptionValuesMetadataStep } from "./steps/update-product-option-values-metadata"
import { updateOptionValueInStrapiStep } from "./steps/update-option-value-in-strapi"
import { deleteOptionValueFromStrapiStep } from "./steps/delete-option-value-from-strapi"

export type UpdateOptionInStrapiWorkflowInput = {
  id: string
}

export const updateOptionInStrapiWorkflow = createWorkflow(
  "update-option-in-strapi",
  (input: UpdateOptionInStrapiWorkflowInput) => {
    // Fetch the option with all necessary fields including metadata
    const { data: options } = useQueryGraphStep({
      entity: "product_option",
      fields: [
        "id",
        "title",
        "product.strapi_product.*",
        "values.*"
      ],
      filters: {
        id: input.id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const strapiOptionId = transform({ options }, (data) => {
      return (data.options[0].product as any)?.strapi_product?.options?.find(
        (option) => option.medusaId === data.options[0].id
      )?.documentId as number
    })

    const updateResult = when({ strapiOptionId }, (data) => !!data.strapiOptionId).then(() => {
      return updateOptionInStrapiStep({
        option: options[0],
      })
    })

    const optionValuesToCreate = transform({ options, updateResult }, (data) => {
      if (!data.updateResult) {
        return []
      }
      // @ts-ignore
      return data.options[0].values.filter((value) => !value.metadata?.strapi_id)
        .map((value) => {
          return {
            id: value.id,
            value: value.value,
            strapiOptionId: data.updateResult!.id
          }
        })
    })

    when({ updateResult, optionValuesToCreate }, (data) => !!data.updateResult && !!data.optionValuesToCreate.length)
      .then(() => {
        const strapiOptionValues = createOptionValuesInStrapiStep({
          optionValues: optionValuesToCreate
        })
  
        const optionValuesMetadataUpdate = transform({ strapiOptionValues }, (data) => {
          return {
            updates: [
              ...data.strapiOptionValues.map((optionValue) => ({
                id: optionValue.medusaId,
                strapiId: optionValue.id,
                strapiDocumentId: optionValue.documentId,
              })),
            ],
          }
        })
    
        updateProductOptionValuesMetadataStep(optionValuesMetadataUpdate)
      })

    const optionValuesToUpdate = transform({ options, updateResult }, (data) => {
      if (!data.updateResult) {
        return []
      }
      return data.options[0].values.filter((value) => value.metadata?.strapi_id)
        .map((value) => {
          return {
            id: value.id,
            value: value.value,
          }
        })
    })

    when({ updateResult, optionValuesToUpdate }, (data) => !!data.updateResult && !!data.optionValuesToUpdate.length)
      .then(() => {
        return updateOptionValueInStrapiStep({
          optionValues: optionValuesToUpdate
        })
      })

    const optionValuesToDelete = transform({ options, updateResult }, (data) => {
      if (!data.updateResult) {
        return []
      }
      return (data.options[0].product as any)?.strapi_product?.options?.find(
        (option) => option.medusaId === data.options[0].id
      )?.values.filter((value) => !data.options[0].values.some((v) => v.id === value.medusaId))
        .map((value) => {
          return value.medusaId
        })
    })

    when({ updateResult, optionValuesToDelete }, (data) => !!data.updateResult && !!data.optionValuesToDelete.length)
      .then(() => {
        return deleteOptionValueFromStrapiStep({
          ids: optionValuesToDelete
        })
      })

    const createResult = when({ strapiOptionId }, (data) => !data.strapiOptionId).then(() => {
      return createOptionsInStrapiWorkflow.runAsStep({
        input: {
          ids: [input.id],
        }
      })
    })

    const result = transform({
      updateResult,
      createResult,
    }, (data) => {
      return data.updateResult || data.createResult
    })

    return new WorkflowResponse({
      strapi_option: result,
    })
  }
)


