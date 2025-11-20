import { 
  createWorkflow, 
  WorkflowResponse,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { UpdateVariantInStrapiInput, updateVariantInStrapiStep } from "./steps/update-variant-in-strapi"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createVariantsInStrapiWorkflow } from "./create-variants-in-strapi"

export type UpdateVariantInStrapiWorkflowInput = {
  id: string
}

export const updateVariantInStrapiWorkflow = createWorkflow(
  "update-variant-in-strapi",
  (input: UpdateVariantInStrapiWorkflowInput) => {
    // Fetch the variant with all necessary fields including option values and metadata
    const { data: variants } = useQueryGraphStep({
      entity: "product_variant",
      fields: [
        "id",
        "title",
        "sku",
        "product_id",
        "product.metadata",
        "product.options.id",
        "product.options.values.id",
        "product.options.values.value",
        "product.options.values.metadata",
        "product.strapi_product.*",
        "options.*",
        "metadata"
      ],
      filters: {
        id: input.id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const createResult = when({ variants }, (data) => !data.variants[0].metadata?.strapi_id).then(() => {
      return createVariantsInStrapiWorkflow.runAsStep({
        input: {
          ids: [input.id],
          productId: variants[0].product_id!,
        }
      })
    })

    const updateResult = when({ variants }, (data) => !!data.variants[0].metadata?.strapi_id).then(() => {
      const {
        variantImages,
        variantThumbnail,
      } = transform({ variants }, (data) => {
        return {
          variantImages: data.variants[0].images?.map((image) => {
            return {
              entity_id: data.variants[0].id,
                url: image.url,
              }
            }) || [],
          variantThumbnail: [{
            entity_id: data.variants[0].id,
            // @ts-ignore
            url: data.variants[0].thumbnail,
          }].filter((image) => image.url !== null),
        }
      })

      const variantData = transform({ 
        variants, 
      }, (data) => {
        return {
          ...data.variants[0],
          optionValueIds: data.variants[0].options.flatMap((option) => {
            // find the strapi option value id for the option value
            return data.variants[0].product?.options.flatMap(
              (productOption) => productOption.values.find(
                (value) => value.value === option.value
              )?.metadata?.strapi_id).filter((value) => value !== undefined)
          }),
        }
      })

      return updateVariantInStrapiStep({
        variant: variantData,
      } as UpdateVariantInStrapiInput)
    })

    const result = transform({
      createResult,
      updateResult,
    }, (data) => {
      return data.createResult || data.updateResult
    })

    return new WorkflowResponse({
      strapi_variant: result,
    })
  }
)

