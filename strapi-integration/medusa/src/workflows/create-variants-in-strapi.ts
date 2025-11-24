import { 
  createWorkflow, 
  WorkflowResponse,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { CreateVariantsInStrapiInput } from "./steps/create-variants-in-strapi"
import { createVariantsInStrapiStep } from "./steps/create-variants-in-strapi"
import { uploadImagesToStrapiStep } from "./steps/upload-images-to-strapi"
import { updateProductVariantsMetadataStep } from "./steps/update-product-variants-metadata"

export type CreateVariantsInStrapiWorkflowInput = {
  ids: string[]
  productId: string
}

export const createVariantsInStrapiWorkflow = createWorkflow(
  "create-variants-in-strapi",
  (input: CreateVariantsInStrapiWorkflowInput) => {
    acquireLockStep({
      key: ["strapi-product-create", input.productId]
    })
    // Fetch the variant with all necessary fields including option values
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
        "images.*",
        "thumbnail",
        "options.*"
      ],
      filters: {
        id: input.ids,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const strapiVariants = when({ variants }, (data) => !!(data.variants[0].product as any)?.strapi_product)
      .then(() => {
        const variantImages = transform({ 
          variants
        }, (data) => {
          return data.variants.flatMap((variant) => variant.images?.map((image) => ({
            entity_id: variant.id,
            url: image.url,
          })) || [])
        })
        const variantThumbnail = transform({ 
          variants
        }, (data) => {
          return data.variants
          // @ts-ignore
          .filter((variant) => !!variant.thumbnail)
          .flatMap((variant) => ({
            entity_id: variant.id,
            // @ts-ignore
            url: variant.thumbnail!,
          }))
        })
    
        const strapiVariantImages = uploadImagesToStrapiStep({
          items: variantImages,
        })
    
        const strapiVariantThumbnail = uploadImagesToStrapiStep({
          items: variantThumbnail,
        }).config({ name: "upload-variant-thumbnail" })
    
        const variantsData = transform({ variants, strapiVariantImages, strapiVariantThumbnail }, (data) => {
          const varData = data.variants.map((variant) => ({
            id: variant.id,
            title: variant.title,
            sku: variant.sku,
            strapiProductId: Number(variant.product?.metadata?.strapi_id),
            strapiVariantImages: data.strapiVariantImages.filter((image) => image.entity_id === variant.id).map((image) => image.image_id),
            strapiVariantThumbnail: data.strapiVariantThumbnail.find((image) => image.entity_id === variant.id)?.image_id,
            optionValueIds: variant.options.flatMap((option) => {
              // find the strapi option value id for the option value
              return variant.product?.options.flatMap(
                (productOption) => productOption.values.find(
                  (value) => value.value === option.value
                )?.metadata?.strapi_id).filter((value) => value !== undefined)
            }),
          }))

          return varData
        })
    
        const strapiVariants = createVariantsInStrapiStep({
          variants: variantsData,
        } as CreateVariantsInStrapiInput)
    
        const variantsMetadataUpdate = transform({ strapiVariants }, (data) => {
          return {
            updates: data.strapiVariants.map((strapiVariant) => ({
              variantId: strapiVariant.medusaId,
              strapiId: strapiVariant.id,
              strapiDocumentId: strapiVariant.documentId,
            })),
          }
        })
    
        updateProductVariantsMetadataStep(variantsMetadataUpdate)

        return strapiVariants
      })

    releaseLockStep({
      key: ["strapi-product-create", input.productId]
    })

    return new WorkflowResponse({
      variants: strapiVariants
    })
  }
)

