import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { retrievePayloadItemsStep } from "./steps/retrieve-payload-items"
import { deletePayloadItemsStep } from "./steps/delete-payload-items"

type WorkflowInput = {
  option_ids: string[]
}

export const deletePayloadProductOptionsWorkflow = createWorkflow(
  "delete-payload-product-options",
  ({ option_ids }: WorkflowInput) => {
    // Retrieve the options to get their Payload IDs
    const retrieveOptionsData = transform({
      option_ids
    }, (data) => {
      return {
        collection: "product-options",
        where: {
          medusa_id: {
            in: data.option_ids.join(",")
          }
        }
      }
    })

    const { items: payloadOptions } = retrievePayloadItemsStep(retrieveOptionsData)

    // Step 2: Delete OptionValues (after products are updated, if any)
    const deleteValuesData = transform({
      payloadOptions,
    }, (data) => {
      if (!data.payloadOptions || data.payloadOptions.length === 0) {
        return null
      }
      const valueIds: string[] = []
      data.payloadOptions.forEach((option) => {
        option.values.forEach((value) => {
          valueIds.push(value.id)
        })
      })
      return {
        collection: "option-values",
        where: {
          id: {
            in: valueIds.join(",")
          }
        }
      }
    })

    const deleteValuesResult = when({ deleteValuesData }, (data) => data.deleteValuesData !== null)
      .then(() => {
        return deletePayloadItemsStep(deleteValuesData).config({ name: "delete-payload-option-values" })
      })

    // Step 3: Delete ProductOptions (after values are deleted, if any)
    // This step always runs, ensuring sequential execution
    const deleteOptionsData = transform({
      payloadOptions,
      deleteValuesResult
    }, (data) => {
      return {
        collection: "product-options",
        where: {
          id: {
            in: data.payloadOptions.map((opt: any) => opt.id).join(",")
          }
        }
      }
    })

    deletePayloadItemsStep(deleteOptionsData)

    return new WorkflowResponse(void 0)
  }
)
