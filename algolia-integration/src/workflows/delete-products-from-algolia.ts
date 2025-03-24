import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { deleteProductsFromAlgoliaStep } from "./steps/delete-products-from-algolia"

type DeleteProductsFromAlgoliaWorkflowInput = {
  ids: string[]
}

export const deleteProductsFromAlgoliaWorkflow = createWorkflow(
  "delete-products-from-algolia",
  (input: DeleteProductsFromAlgoliaWorkflowInput) => {
    deleteProductsFromAlgoliaStep(input)
  }
)