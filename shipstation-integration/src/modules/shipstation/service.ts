import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { CalculatedShippingOptionPrice, FulfillmentOption } from "@medusajs/types"
import { ShipStationClient } from "./client"
import { Label } from "./types"

export type ShipStationOptions = {
  api_key: string
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
    optionData: Record<string, unknown>, 
    data: Record<string, unknown>, 
    context: Record<string, unknown>
  ): Promise<CalculatedShippingOptionPrice> {
    const { shipment_id } = data as {
      shipment_id: string
    }
    const { id: carrier_id, carrier_service_code } = optionData as {
      id: string
      carrier_service_code: string
    }

    const { rates: [rate] } = await this.client.getShipmentRates(shipment_id)

    return {
      calculated_price: rate.shipping_amount.amount + rate.insurance_amount.amount + 
        rate.confirmation_amount.amount + rate.other_amount.amount,
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

    let label: Label | undefined

    if (shipment.items?.length === items.length) {
      label = await this.client.purchaseLabelByShipmentId(shipment_id)
    } else {
      const { shipment_id: _, items: __, ...shipment_data } = shipment
      label = await this.client.purchaseLabel({
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
    }

    return {
      label_id: label.label_id
    }
  }

  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<any> {
    const { label_id } = fulfillment.data as {
      label_id: string
    }

    await this.client.voidLabel(label_id)
  }

  async createReturnFulfillment(fulfillment: Record<string, unknown>): Promise<any> {
    const { label_id } = fulfillment.data as {
      label_id: string
    }

    const returnLabel = await this.client.createReturnLabel(label_id)

    return {
      label_id: returnLabel.label_id
    }
  }

}

export default ShipStationProviderService