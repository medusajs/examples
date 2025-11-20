import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncProductsStep, SyncProductsStepInput } from "./steps/sync-products"
import { ProductStatus } from "@medusajs/framework/utils"

type SyncProductsWorkflowInput = {
  filters?: Record<string, unknown>
  limit?: number
  offset?: number
}

export const syncProductsWorkflow = createWorkflow(
  "sync-products",
  ({ filters, limit, offset }: SyncProductsWorkflowInput) => {
    const productFilters = transform({
      filters
    }, (data) => {
      return {
        status: ProductStatus.PUBLISHED,
        ...data.filters
      }
    })
    const { data, metadata } = useQueryGraphStep({
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
      filters: productFilters,
    })

    syncProductsStep({
      products: data
    } as SyncProductsStepInput)

    // @ts-ignore
    return new WorkflowResponse({
      products: data,
      metadata
    })
  }
)
