import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { CreateFulfillmentResult, FulfillmentDTO, FulfillmentItemDTO, FulfillmentOption, FulfillmentOrderDTO } from "@medusajs/framework/types"

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

  async createFulfillment(
    data: Record<string, unknown>, 
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[], 
    order: Partial<FulfillmentOrderDTO> | undefined, 
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
    // No data is being sent anywhere
    return {
      data,
      labels: []
    }
  }

  async cancelFulfillment(): Promise<any> {
    return {}
  }

  async createReturnFulfillment(): Promise<any> {
    return {}
  }
}

export default DigitalProductFulfillmentService