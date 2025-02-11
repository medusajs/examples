import { MedusaError } from "@medusajs/framework/utils"

type Options = {
  accessToken: string
  sandbox?: boolean
}

export enum MetalSymbols {
  Gold = "XAU",
  Silver = "XAG",
  Platinum = "XPT",
  Palladium = "XPD"
}

export type PriceResponse = {
  metal: MetalSymbols
  currency: string
  exchange: string
  symbol: string
  price: number
  [key: string]: unknown
}

export default class MetalPricesModuleService {
  protected options_: Options

  constructor({}, options: Options) {
    this.options_ = options
  }

  async getMetalPrice(symbol: MetalSymbols, currency: string): Promise<PriceResponse> {
    if (this.options_.sandbox) {
      return {
        metal: symbol,
        currency,
        price: 10,
        exchange: symbol,
        symbol
      }
    }
    const upperCaseSymbol = symbol.toUpperCase()
    const upperCaseCurrency = currency.toUpperCase()
    return fetch(`https://www.goldapi.io/api/${upperCaseSymbol}/${upperCaseCurrency}`, {
      headers: {
        'x-access-token': this.options_.accessToken,
        "Content-Type": "application/json"
      },
      redirect: "follow"
    }).then(response => response.json())
    .then((response) => {
      if (response.error) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          response.error
        )
      }

      return response
    })
  }

  async getMetalSymbols(): Promise<string[]> {
    return Object.values(MetalSymbols)
  }

  async getMetalSymbol(name: string): Promise<MetalSymbols | undefined> {
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    return MetalSymbols[formattedName as keyof typeof MetalSymbols]
  }
}