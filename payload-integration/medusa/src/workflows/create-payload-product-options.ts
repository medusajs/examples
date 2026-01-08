import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { createPayloadItemsStep } from "./steps/create-payload-items";
import { updatePayloadItemsStep } from "./steps/update-payload-items";
import { PayloadCollectionItem, PayloadUpsertData } from "../modules/payload/types";

type WorkflowInput = {
  option_ids: string[]; 
}

export const createPayloadProductOptionsWorkflow = createWorkflow(
  "create-payload-product-options",
  ({ option_ids }: WorkflowInput) => {
    const { data: productOptions } = useQueryGraphStep({
      entity: "product_option",
      fields: [
        "id",
        "title",
        "values.id",
        "values.value"
      ],
      filters: {
        id: option_ids,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    // Create ProductOptions (without values initially)
    const createOptionsData = transform({
      productOptions
    }, (data) => {
      return {
        collection: "product-options",
        items: data.productOptions.map((option) => ({
          medusa_id: option.id,
          title: option.title,
          values: [], // Will be populated after values are created
        }))
      }
    })

    const { items: createdOptions } = createPayloadItemsStep(createOptionsData)

    // Create option values with option references
    const createValuesData = transform({
      productOptions,
      createdOptions
    }, (data) => {
      const optionMap = new Map<string, PayloadCollectionItem>()
      data.createdOptions.forEach((opt) => {
        optionMap.set(opt.medusa_id, opt)
      })

      const valuesToCreate: PayloadUpsertData[] = []
      data.productOptions.forEach((option) => {
        const optionPayload = optionMap.get(option.id)
        if (!optionPayload) return

        option.values.forEach((value) => {
          valuesToCreate.push({
            medusa_id: value.id,
            value: value.value,
            option: optionPayload.id,
          })
        })
      })

      return {
        collection: "option-values",
        items: valuesToCreate
      }
    })

    const { items: createdValues } = createPayloadItemsStep(createValuesData)
      .config({ name: "create-payload-product-options-values" })

    // Update ProductOptions with value references
    const updateOptionsWithValues = transform({
      productOptions,
      createdOptions,
      createdValues
    }, (data) => {
      const optionMap = new Map<string, PayloadCollectionItem>()
      data.createdOptions.forEach((opt) => {
        optionMap.set(opt.medusa_id, opt)
      })

      const valuesMap = new Map<string, PayloadCollectionItem>()
      data.createdValues.forEach((v) => {
        valuesMap.set(v.medusa_id, v)
      })

      const items: PayloadUpsertData[] = []
      data.productOptions.forEach((option) => {
        const payloadOption = optionMap.get(option.id)
        if (!payloadOption) return

        const valuePayloadIds = option.values
          .map((value) => valuesMap.get(value.id)?.id)
          .filter(Boolean) as string[]

        items.push({
          id: payloadOption.id,
          values: valuePayloadIds,
        })
      })

      return {
        collection: "product-options",
        items
      }
    })

    updatePayloadItemsStep(updateOptionsWithValues)

    return new WorkflowResponse({
      items: createdOptions
    })
  }
)
