import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { CalculatedShippingOptionPrice, CalculateShippingOptionPriceDTO, FulfillmentOption } from "@medusajs/framework/types"
import { ShipStationClient } from "./client"

export type ShipStationOptions = {
  api_key: string
  sandbox?: boolean
}

class ShipStationProviderService extends AbstractFulfillmentProviderService {
  static identifier = "shipstation"
  protected options_: ShipStationOptions
  protected client: ShipStationClient

  constructor({}, options: ShipStationOptions) {
    super()

    this.options_ = options
    this.client = new ShipStationClient(options)
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    const { carriers } = await this.client.getCarriers() 
    const fulfillmentOptions: FulfillmentOption[] = []

    carriers
      .filter((carrier) => !carrier.disabled_by_billing_plan)
      .forEach((carrier) => {
        carrier.services.forEach((service) => {
          fulfillmentOptions.push({
            id: carrier.carrier_id,
            carrier_service_code: service.service_code
          })
        })
      })

    return fulfillmentOptions
  }

  async canCalculate(data: Record<string, unknown>): Promise<boolean> {
    return true
  }

  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"], 
    data: CalculateShippingOptionPriceDTO["data"], 
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    const { shipment_id } = data as {
      shipment_id: string
    }

    const { rates: [rate] } = await this.client.getShipmentRates(shipment_id)

    const calculatedPrice = rate.shipping_amount.amount + rate.insurance_amount.amount + 
      rate.confirmation_amount.amount + rate.other_amount.amount + 
      (rate.tax_amount?.amount || 0)

    return {
      calculated_amount: calculatedPrice,
      is_calculated_price_tax_inclusive: !!rate.tax_amount
    }
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>, 
    data: Record<string, unknown>, 
    context: Record<string, unknown>
  ): Promise<any> {
    const { id: carrier_id, carrier_service_code } = optionData as {
      id: string
      carrier_service_code: string
    }
    // TODO get from cart's location
    const ship_from = {}
    // TODO get from cart
    const ship_to = {}

    const { shipment_id } = await this.client.getShippingRates({
      shipment: {
        carrier_id: carrier_id,
        service_code: carrier_service_code,
        // @ts-ignore
        ship_to,
        // @ts-ignore
        ship_from
      },
      rate_options: {
        carrier_ids: [carrier_id],
        service_codes: [carrier_service_code],
        // TODO check if this is correct
        preferred_currency: context.currency_code as string
      }
    })

    return {
      ...data,
      shipment_id
    }
  }

  async createFulfillment(
    data: object, 
    items: object[], 
    order: object | undefined, 
    fulfillment: Record<string, unknown>
  ): Promise<any> {
    const { shipment_id } = data as {
      shipment_id: string
    }

    const shipment = await this.client.getShipment(shipment_id)

    const { shipment_id: _, ...shipment_data } = shipment
    const label = await this.client.purchaseLabel({
      shipment: {
        ...shipment_data,
        items: items.map((item) => ({
          // @ts-ignore
          name: item.title,
          // @ts-ignore
          sku: item.sku,
          // @ts-ignore
          quantity: item.quantity
        }))
      },
      outbound_label_id: shipment.shipment_id,
    })

    return {
      data: {
        ...(fulfillment.data as object || {}),
        label_id: label.label_id,
        shipment_id: label.shipment_id
      },
    }
  }

  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<any> {
    const { label_id, shipment_id } = fulfillment.data as {
      label_id: string
      shipment_id: string
    }

    await this.client.voidLabel(label_id)
    await this.client.cancelShipment(shipment_id)
  }

}

export default ShipStationProviderService