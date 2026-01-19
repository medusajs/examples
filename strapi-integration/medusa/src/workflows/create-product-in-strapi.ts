import { 
  createWorkflow, 
  WorkflowResponse,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { 
  CreateProductInStrapiInput, 
  createProductInStrapiStep
} from "./steps/create-product-in-strapi"
import { uploadImagesToStrapiStep } from "./steps/upload-images-to-strapi"
import { 
  useQueryGraphStep, 
  updateProductsWorkflow, 
  acquireLockStep, 
  releaseLockStep
} from "@medusajs/medusa/core-flows"
import { createOptionsInStrapiWorkflow } from "./create-options-in-strapi"
import { createVariantsInStrapiWorkflow } from "./create-variants-in-strapi"
import { updateProductInStrapiStep } from "./steps/update-product-in-strapi"
import { retrieveFromStrapiStep } from "./steps/retrieve-from-strapi"
import { Collection } from "../modules/strapi/service"

export type CreateProductInStrapiWorkflowInput = {
  id: string
}

export const createProductInStrapiWorkflow = createWorkflow(
  "create-product-in-strapi",
  (input: CreateProductInStrapiWorkflowInput) => {
    acquireLockStep({
      key: ["strapi-product-create", input.id],
      timeout: 60
    })
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "title",
        "subtitle",
        "description",
        "handle",
        "images.url",
        "thumbnail",
        "variants.id",
        "options.id",
      ],
      filters: {
        id: input.id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const productImages = transform({ products }, (data) => {
      return data.products[0].images.map((image) => {
        return {
          entity_id: data.products[0].id,
          url: image.url,
        }
      })
    })

    const strapiProductImages = uploadImagesToStrapiStep({
      items: productImages,
    })

    const strapiProductThumbnail = when(
      ({ products }), 
      // @ts-ignore
      (data) => !!data.products[0].thumbnail
    ).then(() => {
      return uploadImagesToStrapiStep({
        items: [{
          entity_id: products[0].id,
          url: products[0].thumbnail!,
        }],
      }).config({ name: "upload-product-thumbnail" })
    })

    const productWithImages = transform(
      { strapiProductImages, strapiProductThumbnail, products },
      (data) => {
        return {
          id: data.products[0].id,
          title: data.products[0].title,
          subtitle: data.products[0].subtitle,
          description: data.products[0].description,
          handle: data.products[0].handle,
          imageIds: data.strapiProductImages.map((image) => image.image_id),
          thumbnailId: data.strapiProductThumbnail?.[0]?.image_id,
        }
      }
    )

    const strapiProduct = createProductInStrapiStep({
      product: productWithImages,
    } as CreateProductInStrapiInput)

    const productMetadataUpdate = transform({ strapiProduct }, (data) => {
      return {
        selector: { id: data.strapiProduct.medusaId },
        update: {
          metadata: {
            strapi_id: data.strapiProduct.id,
            strapi_document_id: data.strapiProduct.documentId,
          },
        },
      }
    })

    updateProductsWorkflow.runAsStep({
      input: productMetadataUpdate,
    })

    const variantIds = transform({ 
      products
    }, (data) => data.products[0].variants.map((variant) => variant.id))
    const optionIds = transform({
      products
    }, (data) => data.products[0].options.map((option) => option.id))

    const existingStrapiOptions = retrieveFromStrapiStep({
      collection: Collection.PRODUCT_OPTIONS,
      ids: optionIds,
    })

    const optionsToCreate = transform({ existingStrapiOptions, optionIds }, (data) => {
      const existingMedusaIds = new Set(data.existingStrapiOptions.map((option) => option.medusaId))
      return data.optionIds.filter((id: string) => !existingMedusaIds.has(id))
    })

    const newStrapiOptions = when({ optionsToCreate }, (data) => data.optionsToCreate.length > 0).then(() => {
      return createOptionsInStrapiWorkflow.runAsStep({
        input: {
          ids: optionsToCreate,
        }
      })
    })

    const strapiOptionIds = transform({ existingStrapiOptions, newStrapiOptions }, (data): number[] => {
      const existingIds = (data.existingStrapiOptions || []).map((option) => option.id).filter(Boolean) as number[]
      const newIds = data.newStrapiOptions ? (data.newStrapiOptions.strapi_options || []).map((option) => option.id).filter(Boolean) as number[] : []
      return [...existingIds, ...newIds]
    })

    when({ strapiOptionIds }, (data) => data.strapiOptionIds.length > 0).then(() => {
      return updateProductInStrapiStep({
        product: {
          id: input.id,
          optionIds: strapiOptionIds,
        },
      })
    })

    releaseLockStep({
      key: ["strapi-product-create", input.id]
    })

    createVariantsInStrapiWorkflow.runAsStep({
      input: {
        ids: variantIds,
        productId: input.id
      }
    })

    return new WorkflowResponse(strapiProduct)
  }
)

