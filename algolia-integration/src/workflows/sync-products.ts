import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncProductsStep, SyncProductsStepInput } from "./steps/sync-products"
import { deleteProductsFromAlgoliaStep } from "./steps/delete-products-from-algolia"

type SyncProductsWorkflowInput = {
  filters?: Record<string, unknown>
  limit?: number
  offset?: number
}

export const syncProductsWorkflow = createWorkflow(
  "sync-products",
  ({ filters, limit, offset }: SyncProductsWorkflowInput) => {
    const { data: products, metadata } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id", 
        "title", 
        "description", 
        "handle", 
        "thumbnail", 
        "categories.id",
        "categories.name",
        "categories.handle",
        "tags.id",
        "tags.value"
      ],
      pagination: {
        take: limit,
        skip: offset
      },
      filters,
    })

    const {
      publishedProducts,
      unpublishedProductsToDelete
    } = transform({
      products,
    }, (data) => {
      const publishedProducts: SyncProductsStepInput["products"] = []
      const unpublishedProductsToDelete: string[] = []

      data.products.forEach((product) => {
        if (product.status === "published") {
          const { status, ...rest } = product
          publishedProducts.push(rest as SyncProductsStepInput["products"][0])
        } else {
          unpublishedProductsToDelete.push(product.id)
        }
      })

      return {
        publishedProducts,
        unpublishedProductsToDelete
      }
    })

    syncProductsStep({
      products: publishedProducts
    })

    deleteProductsFromAlgoliaStep({
      ids: unpublishedProductsToDelete
    })

    return new WorkflowResponse({
      products,
      metadata
    })
  }
)
