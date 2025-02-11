import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import MagentoModuleService from "../../modules/magento/service";
import { MAGENTO_MODULE } from "../../modules/magento";

export const getMagentoCategoriesStep = createStep(
  {
    name: "get-magento-categories",
    async: true,
  },
  async ({}, { container }) => {
    const magentoModuleService: MagentoModuleService = container.resolve(MAGENTO_MODULE)

    const magentoCategories = await magentoModuleService.getCategories()

    return new StepResponse(magentoCategories)
  }
)