import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { retrievePayloadItemsStep } from "./steps/retrieve-payload-items";
import { createPayloadItemsStep } from "./steps/create-payload-items";
import { updatePayloadItemsStep } from "./steps/update-payload-items";
import { deletePayloadItemsStep } from "./steps/delete-payload-items";
import { PayloadCollectionItem, PayloadUpsertData } from "../modules/payload/types";

type WorkflowInput = {
  option_ids: string[]; 
}

export const updatePayloadProductOptionsWorkflow = createWorkflow(
  "update-payload-product-options",
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

    // Retrieve existing options from Payload
    const retrieveOptionsData = transform({
      productOptions
    }, (data) => {
      return {
        collection: "product-options",
        where: {
          medusa_id: {
            in: data.productOptions.map((o: any) => o.id).join(",")
          }
        }
      }
    })

    const { items: existingOptions } = retrievePayloadItemsStep(retrieveOptionsData)

    // Retrieve existing option values for these options
    const retrieveValuesData = transform({
      existingOptions
    }, (data) => {
      if (data.existingOptions.length === 0) {
        return null
      }
      const optionPayloadIds = data.existingOptions.map((opt: any) => opt.id)
      return {
        collection: "option-values",
        where: {
          option: {
            in: optionPayloadIds.join(",")
          }
        }
      }
    })

    const { items: existingValues } = retrievePayloadItemsStep(retrieveValuesData)
      .config({ name: "retrieve-payload-option-values" })

    // Create new OptionValues and identify values to delete
    const { createValuesData, deleteValuesData } = transform({
      productOptions,
      existingOptions,
      existingValues
    }, (data) => {
      const existingValueIds = new Set(
        (data.existingValues || []).map((v) => v.medusa_id)
      )
      const optionToPayloadId = new Map<string, string>()
      data.existingOptions.forEach((opt) => {
        optionToPayloadId.set(opt.medusa_id, opt.id)
      })

      const valuesToCreate: PayloadUpsertData[] = []
      const currentValueIds = new Set<string>()

      data.productOptions.forEach((option) => {
        const optionPayloadId = optionToPayloadId.get(option.id)
        if (!optionPayloadId) return

        option.values.forEach((value) => {
          currentValueIds.add(value.id)
          
          // Only create if it doesn't exist
          if (!existingValueIds.has(value.id)) {
            valuesToCreate.push({
              medusa_id: value.id,
              value: value.value,
              option: optionPayloadId,
            })
          }
        })
      })

      // Find values to delete (exist in Payload but not in current Medusa option values)
      const valuesToDelete = (data.existingValues || []).filter((v) => {
        return !currentValueIds.has(v.medusa_id)
      })

      const deletedMedusaIdsSet = new Set(valuesToDelete.map((v) => v.medusa_id))

      return {
        createValuesData: {
          collection: "option-values",
          items: valuesToCreate
        },
        deleteValuesData: {
          collection: "option-values",
          where: {
            medusa_id: {
              in: Array.from(deletedMedusaIdsSet).join(",")
            }
          }
        },
      }
    })

    const createdValuesResult = when({ createValuesData }, (data) => data.createValuesData.items.length > 0)
      .then(() => {
        return createPayloadItemsStep(createValuesData)
      })

    when({ deleteValuesData }, (data) => data.deleteValuesData.where.medusa_id.in.length > 0)
      .then(() => {
        return deletePayloadItemsStep(deleteValuesData)
      })

    // Update ProductOptions with value references
    const updateOptionsData = transform({
      productOptions,
      existingOptions,
      createdValuesResult,
      existingValues,
      deleteValuesData
    }, (data) => {
      const deletedMedusaIds = new Set(
        data.deleteValuesData.where.medusa_id.in.split(",")
      )
      
      const allValues = [
        ...(data.createdValuesResult?.items || []), 
        ...(data.existingValues || [])
      ].filter((v) => !deletedMedusaIds.has(v.medusa_id))

      const optionMap = new Map<string, PayloadCollectionItem>()
      data.existingOptions.forEach((opt) => {
        optionMap.set(opt.medusa_id, opt)
      })

      const items = data.productOptions
        .map((option) => {
          const existing = optionMap.get(option.id)
          if (!existing) return null

          const valueIds = allValues
            .filter((v) => v.option?.id === existing.id)
            .map((v) => v.id)

          return {
            id: existing.id,
            values: valueIds,
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
      
      return {
        collection: "product-options",
        items,
      }
    })

    const result = when({ updateOptionsData }, (data) => data.updateOptionsData.items.length > 0)
      .then(() => {
        return updatePayloadItemsStep(updateOptionsData)
      })

    const items = transform({ result }, (data) => data.result?.items || [])

    return new WorkflowResponse({
      items
    })
  }
)

