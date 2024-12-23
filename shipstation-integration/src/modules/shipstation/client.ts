import { MedusaError } from "@medusajs/framework/utils";
import { ShipStationOptions } from "./service";
import { CarriersResponse, GetShippingRatesRequest, GetShippingRatesResponse, Label, PurchaseLabelRequest, RateResponse, Shipment, VoidLabelResponse } from "./types";

export class ShipStationClient {
  options: ShipStationOptions

  constructor(options) {
    this.options = options
  }

  private async sendRequest(url: string, data?: RequestInit): Promise<any> {
    return fetch(`https://api.shipstation.com/v2${url}`, {
      ...data,
      headers: {
        ...data?.headers,
        'api-key': this.options.api_key,
        "Content-Type": "application/json"
      }
    }).then((resp) => {
      const contentType = resp.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        return resp.text()
      }

      return resp.json()
    })
    .then((resp) => {
      if (typeof resp !== "string" && resp.errors?.length) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `An error occured while sending a request to ShipStation: ${
            resp.errors.map((error) => error.message)
          }`
        )
      }

      return resp
    })
  }

  async getCarriers(): Promise<CarriersResponse> {
    return await this.sendRequest("/carriers") 
  }

  async getShippingRates(data: GetShippingRatesRequest): Promise<GetShippingRatesResponse> {
    return await this.sendRequest("/rates", {
      method: "POST",
      body: JSON.stringify(data)
    }).then((resp) => {
      if (resp.rate_response.errors?.length) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `An error occured while retrieving rates from ShipStation: ${
            resp.rate_response.errors.map((error) => error.message)
          }`
        )
      }

      return resp
    })
  }

  async getShipmentRates(id: string): Promise<RateResponse[]> {
    return await this.sendRequest(`/shipments/${id}/rates`)
  }

  async purchaseLabelForShipment(id: string): Promise<Label> {
    return await this.sendRequest(`/labels/shipment/${id}`, {
      method: "POST",
      body: JSON.stringify({})
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

  async getShipment(id: string): Promise<Shipment> {
    return await this.sendRequest(`/shipments/${id}`)
  }
}