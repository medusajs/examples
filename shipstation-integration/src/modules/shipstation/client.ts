import { ShipStationOptions } from "./service";
import { CarriersResponse, GetShippingRatesRequest, GetShippingRatesResponse, Label, PurchaseLabelRequest, RateResponse, Shipment, VoidLabelResponse } from "./types";

export class ShipStationClient {
  options: ShipStationOptions

  constructor(options) {
    this.options = options
  }

  private async sendRequest(url: string, data?: RequestInit): Promise<any> {
    const baseUrl = this.options.sandbox ? 
      `https://docs.shipstation.com/_mock/openapi/v2`
      : `https://api.shipstation.com/v2`

    return fetch(`${baseUrl}${url}`, {
      ...data,
      headers: {
        ...data?.headers,
        'api-key': this.options.api_key,
        "Content-Type": "application/"
      }
    }).then((resp) => resp.json())
  }

  async getCarriers(): Promise<CarriersResponse> {
    return await this.sendRequest("/carriers") 
  }

  async getShippingRates(data: GetShippingRatesRequest): Promise<GetShippingRatesResponse> {
    return await this.sendRequest("/rates", {
      body: JSON.stringify(data)
    })
  }

  async getShipmentRates(id: string): Promise<RateResponse> {
    return await this.sendRequest(`/shipments/${id}/rates`)
  }

  async getShipment(id: string): Promise<Shipment> {
    return await this.sendRequest(`/shipments/${id}`)
  }

  async purchaseLabel(data: PurchaseLabelRequest): Promise<Label> {
    return await this.sendRequest(`/labels`, {
      method: "POST",
      body: JSON.stringify(data)
    })
  }

  async voidLabel(id: string): Promise<VoidLabelResponse> {
    return await this.sendRequest(`/labels/${id}/void`, {
      method: "PUT"
    })
  }

  async cancelShipment(id: string): Promise<void> {
    return await this.sendRequest(`/shipments/${id}/cancel`, {
      method: "PUT"
    })
  }

  async createReturnLabel(id: string): Promise<Label> {
    return await this.sendRequest(`/labels/${id}/return`, {
      method: "POST"
    })
  }
}