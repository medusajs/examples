import { createWorkflow, when } from "@medusajs/framework/workflows-sdk"
import { EntryProps } from "contentful-management"
import { prepareUpdateDataStep } from "./steps/prepare-update-data"
import { updateProductOptionsWorkflow, updateProductsWorkflow, updateProductVariantsWorkflow, UpdateProductOptionsWorkflowInput } from "@medusajs/medusa/core-flows"
import { UpsertProductDTO, UpsertProductVariantDTO } from "@medusajs/framework/types"

export type HandleContentfulHookWorkflowInput = {
  entry: EntryProps
}

export const handleContentfulHookWorkflow = createWorkflow(
  { name: "handle-contentful-hook-workflow" },
  (input: HandleContentfulHookWorkflowInput) => {
    const prepareUpdateData = prepareUpdateDataStep({
      entry: input.entry,
    })

    when(input, (input) => input.entry.sys.contentType.sys.id === "product")
      .then(() => {
        updateProductsWorkflow.runAsStep({
          input: {
            products: [prepareUpdateData as UpsertProductDTO],
          }
        })
      })

    when(input, (input) => input.entry.sys.contentType.sys.id === "productVariant")
      .then(() => {
        updateProductVariantsWorkflow.runAsStep({
          input: {
            product_variants: [prepareUpdateData as UpsertProductVariantDTO],
          }
        })
      })

    when(input, (input) => 
      input.entry.sys.contentType.sys.id === "productOption"
    )
    .then(() => {
      updateProductOptionsWorkflow.runAsStep({
        input: prepareUpdateData as unknown as UpdateProductOptionsWorkflowInput
      })
    })
  }
)