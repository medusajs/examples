import { 
  createWorkflow, 
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { prepareStrapiUpdateDataStep } from "./steps/prepare-strapi-update-data"
import { clearProductCacheStep } from "./steps/clear-product-cache"
import { updateProductOptionValueStep } from "./steps/update-product-option-value"
import { 
  updateProductsWorkflow, 
  updateProductVariantsWorkflow, 
  updateProductOptionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { 
  UpsertProductDTO, 
  UpsertProductVariantDTO,
} from "@medusajs/framework/types"

export type WorkflowInput = {
  entry: any
}

export const handleStrapiWebhookWorkflow = createWorkflow(
  "handle-strapi-webhook-workflow",
  (input: WorkflowInput) => {
    const preparedData = prepareStrapiUpdateDataStep({
      entry: input.entry,
    })

    when(input, (input) => input.entry.model === "product")
      .then(() => {
        updateProductsWorkflow.runAsStep({
          input: {
            products: [preparedData.data as unknown as UpsertProductDTO],
          },
        })

        // Clear the product cache after update
        const productId = transform({ preparedData }, (data) => {
          return (data.preparedData.data as any).id
        })

        clearProductCacheStep({ productId })
      })

    when(input, (input) => input.entry.model === "product-variant")
      .then(() => {
        const variants = updateProductVariantsWorkflow.runAsStep({
          input: {
            product_variants: [preparedData.data as unknown as UpsertProductVariantDTO],
          },
        })

        clearProductCacheStep({ 
          productId: variants[0].product_id!
        }).config({ name: "clear-product-cache-variant" })
      })

    when(input, (input) => input.entry.model === "product-option")
      .then(() => {
        updateProductOptionsWorkflow.runAsStep({
          input: preparedData.data as any,
        })

        // Since options can belong to multiple products (manyToMany), 
        // we need to find all products that use this option
        const { data: products } = useQueryGraphStep({
          entity: "product",
          fields: ["id"],
          filters: {
            options: {
              id: (preparedData.data.selector as Record<string, string>).id,
            },
          },
        }).config({ name: "get-products-from-option" })

        // Clear cache for all products that use this option
        const productIds = transform({ products }, (data) => {
          return data.products.map((p) => p.id) as string[]
        })

        clearProductCacheStep({ 
          productId: productIds
        }).config({ name: "clear-product-cache-option" })
      })

    when(input, (input) => input.entry.model === "product-option-value")
      .then(() => {
        // Update the option value using the Product Module
        const optionValueData = transform({ preparedData }, (data) => ({
          id: data.preparedData.data.optionValueId as string,
          value: data.preparedData.data.value as string,
        }))

        updateProductOptionValueStep(optionValueData)

        // Find all variants that use this option value to clear their product cache
        const { data: variants } = useQueryGraphStep({
          entity: "product_variant",
          fields: [
            "id",
            "product_id",
          ],
          filters: {
            options: {
              id: preparedData.data.optionValueId as string,
            },
          },
        }).config({ name: "get-variants-from-option-value" })

        // Clear the product cache for all affected products
        const productIds = transform({ variants }, (data) => {
          const uniqueProductIds = [...new Set(data.variants.map((v) => v.product_id))]
          return uniqueProductIds as string[]
        })

        clearProductCacheStep({ 
          productId: productIds
        }).config({ name: "clear-product-cache-option-value" })
      })
  }
)

