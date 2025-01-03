import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { deleteDigitalProductsSteps } from "./steps/delete-digital-products";
import { retrieveDigitalProductsToDeleteStep } from "./steps/retrieve-digital-products-to-delete";

type DeleteProductDigitalProductsInput = {
  id: string
}

export const deleteProductDigitalProductsWorkflow = createWorkflow(
  "delete-product-digital-products",
  (input: DeleteProductDigitalProductsInput) => {
    const digitalProductsToDelete = retrieveDigitalProductsToDeleteStep({
      product_id: input.id
    })

    deleteDigitalProductsSteps({
      ids: digitalProductsToDelete
    })

    return new WorkflowResponse({})
  }
)