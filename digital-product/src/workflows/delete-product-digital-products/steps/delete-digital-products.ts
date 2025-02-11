import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DIGITAL_PRODUCT_MODULE } from "../../../modules/digital-product"
import DigitalProductModuleService from "../../../modules/digital-product/service"

type DeleteDigitalProductsStep = {
  ids: string[]
}

export const deleteDigitalProductsSteps = createStep(
  "delete-digital-products",
  async ({ ids }: DeleteDigitalProductsStep, { container }) => {
    const digitalProductService: DigitalProductModuleService = 
      container.resolve(DIGITAL_PRODUCT_MODULE)

    await digitalProductService.softDeleteDigitalProducts(ids)

    return new StepResponse({}, ids)
  },
  async (ids, { container }) => {
    if (!ids) {
      return
    }

    const digitalProductService: DigitalProductModuleService = 
      container.resolve(DIGITAL_PRODUCT_MODULE)

    await digitalProductService.restoreDigitalProducts(ids)
  }
)