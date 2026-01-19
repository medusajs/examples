import { 
  createWorkflow, 
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { createOptionsInStrapiStep } from "./steps/create-options-in-strapi"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { CreateOptionValuesInStrapiInput, createOptionValuesInStrapiStep } from "./steps/create-option-values-in-strapi"
import { updateProductOptionValuesMetadataStep } from "./steps/update-product-option-values-metadata"

export type CreateOptionsInStrapiWorkflowInput = {
  ids: string[]
}

export const createOptionsInStrapiWorkflow = createWorkflow(
  "create-options-in-strapi",
  (input: CreateOptionsInStrapiWorkflowInput) => {
    // Fetch the option with all necessary fields
    // including metadata
    const { data: options } = useQueryGraphStep({
      entity: "product_option",
      fields: [
        "id",
        "title",
        "metadata",
        "values.id",
        "values.value",
        "values.metadata",
      ],
      filters: {
        id: input.ids,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    // @ts-ignore
    const preparedOptions = transform({ options }, (data) => {
      return data.options.map((option) => ({
        id: option.id,
        title: option.title,
      }))
    })

    // Pass the prepared option data to the step
    const strapiOptions = createOptionsInStrapiStep({
      options: preparedOptions,
    })
    
    // Extract option values
    const optionValuesData = transform({ options, strapiOptions }, (data) => {
      return data.options.flatMap((option) => {
        return option.values.map((value) => {
          const strapiOption = data.strapiOptions.find(
            (strapiOption) => strapiOption.medusaId === option.id
          )
          if (!strapiOption) {
            return null
          }
          return {
            id: value.id,
            value: value.value,
            strapiOptionId: strapiOption.id,
          }
        })
      })
    })
    
    const strapiOptionValues = createOptionValuesInStrapiStep({
      optionValues: optionValuesData,
    } as CreateOptionValuesInStrapiInput)

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

    return new WorkflowResponse({
      strapi_options: strapiOptions,
    })
  }
)

