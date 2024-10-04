import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { FulfillmentOption } from "@medusajs/framework/types"

class DigitalProductFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "digital"

  constructor() {
    super()
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      {
        id: "digital-fulfillment",
      },
    ]
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<any> {
    return data
  }

  async validateOption(data: Record<string, any>): Promise<boolean> {
    return true
  }

  async createFulfillment(): Promise<Record<string, any>> {
    // No data is being sent anywhere
    return {}
  }

  async cancelFulfillment(): Promise<any> {
    return {}
  }

  async createReturnFulfillment(): Promise<any> {
    return {}
  }
}

export default DigitalProductFulfillmentService