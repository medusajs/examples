import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import RestockModuleService from "../../../modules/restock/service";
import { RESTOCK_MODULE } from "../../../modules/restock";

export const getDistinctSubscriptionsStep = createStep(
  "get-distinct-subscriptions",
  async (_, { container }) => {
    const restockModuleService: RestockModuleService = container.resolve(
      RESTOCK_MODULE
    )

    const distinctSubscriptions = await restockModuleService.getUniqueSubscriptions()

    return new StepResponse(distinctSubscriptions)
  }
)