import { ITaxProvider, ItemTaxCalculationLine, ItemTaxLineDTO, ShippingTaxCalculationLine, ShippingTaxLineDTO, TaxCalculationContext } from "@medusajs/framework/types";
import Avatax from "avatax";
import { ModuleOptions } from "./types";
import { MedusaError } from "@medusajs/framework/utils";

type InjectedDependencies = {
  // avatax: Avatax
}


class AvalaraTaxModuleProvider implements ITaxProvider {
  static identifier = "avalara"
  private readonly avatax: Avatax

  constructor(dependencies: InjectedDependencies, options: ModuleOptions) {
    if (!options?.username || !options?.password) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Avalara module options are required: username and password"
      )
    }
    this.avatax = new Avatax({
      appName: options.appName || "medusa",
      appVersion: options.appVersion || "1.0.0",
      machineName: options.machineName || "medusa",
      environment: options.appEnvironment === "production" ? "production" : "sandbox",
      timeout: options.timeout || 3000,
    }).withSecurity({
      username: options.username,
      password: options.password,
    })
  }
  getIdentifier(): string {
    return AvalaraTaxModuleProvider.identifier
  }
  async getTaxLines(
    itemLines: ItemTaxCalculationLine[], 
    shippingLines: ShippingTaxCalculationLine[],
    context: TaxCalculationContext
  ): Promise<(ItemTaxLineDTO | ShippingTaxLineDTO)[]> {
    console.log("getTaxLines", itemLines, shippingLines, context)
    try {
      const currencyCode = (
        itemLines[0]?.line_item.currency_code || shippingLines[0]?.shipping_line.currency_code
      )?.toUpperCase()
      const itemsResponse = itemLines.length ? await this.avatax.createTransaction({
        model: {
          lines: itemLines.map((line) => {
            return {
              number: line.line_item.id,
              quantity: Number(line.line_item.quantity) ?? 0,
              amount: Number(line.line_item.unit_price) ?? 0,
              taxCode: line.rates.find((rate) => rate.is_default)?.code ?? "",
            }
          }),
          date: new Date(),
          customerCode: context.customer?.id ?? "",
          addresses: {
            "singleLocation": {
              line1: context.address.address_1 ?? "",
              line2: context.address.address_2 ?? "",
              city: context.address.city ?? "",
              region: context.address.province_code ?? "",
              postalCode: context.address.postal_code ?? "",
              country: context.address.country_code.toUpperCase() ?? "",
            },
          },
          currencyCode,
        },
        include: "Details"
      }) : undefined
      const shippingResponse = shippingLines.length ? await this.avatax.createTransaction({
        model: {
          lines: shippingLines.map((line) => {
            return {
              number: line.shipping_line.id,
              quantity: 1,
              amount: Number(line.shipping_line.unit_price) ?? 0,
              taxCode: line.rates.find((rate) => rate.is_default)?.code ?? "",
            }
          }),
          date: new Date(),
          customerCode: context.customer?.id ?? "",
          addresses: {
            "singleLocation": {
              line1: context.address.address_1 ?? "",
              line2: context.address.address_2 ?? "",
              city: context.address.city ?? "",
              region: context.address.province_code ?? "",
              postalCode: context.address.postal_code ?? "",
              country: context.address.country_code.toUpperCase() ?? "",
            }
          },
          currencyCode,
        },
      }) : undefined

      const taxLines: (ItemTaxLineDTO | ShippingTaxLineDTO)[] = []
      itemsResponse?.lines?.forEach((line) => {
        line.details?.forEach((detail) => {
          taxLines.push({
            rate: detail.rate ?? 0,
            name: detail.taxName ?? "",
            code: line.taxCode || detail.rateTypeCode || detail.signatureCode || "",
            provider_id: this.getIdentifier(),
            line_item_id: line.lineNumber ?? "",
          })
        })
      })
      shippingResponse?.lines?.forEach((line) => {
        line.details?.forEach((detail) => {
          taxLines.push({
            rate: detail.rate ?? 0,
            name: detail.taxName ?? "",
            code: line.taxCode || detail.rateTypeCode || detail.signatureCode || "",
            provider_id: this.getIdentifier(),
            shipping_line_id: line.lineNumber ?? "",
          })
        })
      })

      return taxLines
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred while getting tax lines from Avalara: ${error}`
      )
    }
  }
}

export default AvalaraTaxModuleProvider