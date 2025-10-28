import {
  createWorkflow,
  WorkflowResponse,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep, createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { createRentalConfigurationStep } from "./steps/create-rental-configuration"
import { updateRentalConfigurationStep } from "./steps/update-rental-configuration"
import { RENTAL_MODULE } from "../modules/rental"

type UpsertRentalConfigWorkflowInput = {
  product_id: string
  min_rental_days?: number
  max_rental_days?: number | null
  status?: "active" | "inactive"
}

export const upsertRentalConfigWorkflow = createWorkflow(
  "upsert-rental-config",
  (input: UpsertRentalConfigWorkflowInput) => {
    // Retrieve product with its rental configuration
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: ["id", "rental_configuration.*"],
      filters: { id: input.product_id },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    // If rental config doesn't exist, create it and link
    const createdConfig = when({ products }, (data) => {
      return !data.products[0]?.rental_configuration
    }).then(() => {
      const newConfig = createRentalConfigurationStep({
        product_id: input.product_id,
        min_rental_days: input.min_rental_days,
        max_rental_days: input.max_rental_days,
        status: input.status,
      })

      // Create link between product and rental configuration
      const linkData = transform({ newConfig, product_id: input.product_id }, (data) => {
        return [
          {
            [Modules.PRODUCT]: {
              product_id: data.product_id,
            },
            [RENTAL_MODULE]: {
              rental_configuration_id: data.newConfig.id,
            },
          },
        ]
      })

      createRemoteLinkStep(linkData)

      return newConfig
    })

    // If rental config exists, update it
    // @ts-ignore
    const updatedConfig = when({ products }, (data) => {
      return !!data.products[0]?.rental_configuration
    }).then(() => {
      return updateRentalConfigurationStep({
        id: products[0].rental_configuration!.id,
        min_rental_days: input.min_rental_days,
        max_rental_days: input.max_rental_days,
        status: input.status,
      })
    })

    // Return whichever config was created or updated
    const rentalConfig = transform({ updatedConfig, createdConfig }, (data) => {
      return data.updatedConfig || data.createdConfig
    })

    return new WorkflowResponse(rentalConfig)
  }
)
