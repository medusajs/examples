import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MAGENTO_MODULE } from "../../modules/magento";
import MagentoModuleService from "../../modules/magento/service";

type GetMagentoProductsInput = {
  currentPage: number
  pageSize: number
}

export const getMagentoProductsStep = createStep(
  "get-magento-products",
  async ({ currentPage, pageSize }: GetMagentoProductsInput, { container }) => {
    const magentoModuleService: MagentoModuleService = container.resolve(MAGENTO_MODULE)

    const response = await magentoModuleService.getProducts({
      currentPage,
      pageSize
    })

    return new StepResponse(response)
  }
)