import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ProductVariantDTO } from "@medusajs/framework/types"
import { METAL_PRICES_MODULE } from "../../modules/metal-prices";
import MetalPricesModuleService from "../../modules/metal-prices/service";
import { MedusaError } from "@medusajs/framework/utils";
import { MetalSymbols } from "../../modules/metal-prices/service";

export type GetVariantMetalPricesStepInput = {
  variant: ProductVariantDTO & {
    calculated_price?: {
      calculated_amount: number
    }
  }
  currencyCode: string
  quantity?: number
}

export const getVariantMetalPricesStep = createStep(
  "get-variant-metal-prices",
  async ({
    variant,
    currencyCode,
    quantity = 1
  }: GetVariantMetalPricesStepInput, { container }) => {
    const metalPricesModuleService: MetalPricesModuleService = 
      container.resolve(METAL_PRICES_MODULE)
    const variantMetal = variant.options.find((option) => option.option?.title === "Metal")?.value
    const metalSymbol = await metalPricesModuleService.getMetalSymbol(variantMetal || "")

    if (!metalSymbol) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Variant doesn't have metal. Make sure the variant's SKU matches a metal symbol."
      )
    }

    if (!variant.weight) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Variant doesn't have weight. Make sure the variant has weight to calculate its price."
      )
    }

    let price = variant.calculated_price?.calculated_amount || 0
    const weight = variant.weight
    const { price: metalPrice } = await metalPricesModuleService.getMetalPrice(
      metalSymbol as MetalSymbols, currencyCode
    )
    price += (metalPrice * weight * quantity)

    return new StepResponse(price)
  }
)