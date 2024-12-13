export type Carrier = {
  carrier_id: string
  disabled_by_billing_plan: boolean
  services: {
    service_code: string
  }[]
  [k: string]: unknown
}

export type CarriersResponse = {
  carriers: Carrier[]
}

export type ShipStationAddress = {
  name: string
  phone: string
  email?: string | null
  company_name?: string | null
  address_line1: string
  address_line2?: string | null
  address_line3?: string | null
  city_locality: string
  state_province: string
  postal_code: string
  country_code: string
  address_residential_indicator: "unknown" | "yes" | "no"
  instructions?: string | null
  geolocation?: {
    type?: string
    value?: string
  }[]
}

export type Rate = {
  rate_id: string
  shipping_amount: {
    currency: string
    amount: number
  }
  insurance_amount: {
    currency: string
    amount: number
  }
  confirmation_amount: {
    currency: string
    amount: number
  }
  other_amount: {
    currency: string
    amount: number
  }
  tax_amount: {
    currency: string
    amount: number
  }
}

export type RateResponse = {
  rates: Rate[]
}

export type GetShippingRatesRequest = {
  shipment_id?: string
  shipment?: Omit<Shipment, "shipment_id" | "shipment_status">
  rate_options: {
    carrier_ids: string[]
    service_codes: string[]
    preferred_currency: string
  }
}

export type GetShippingRatesResponse = {
  shipment_id: string
  carrier_id?: string
  service_code?: string
  external_order_id?: string
  rate_response: RateResponse
}

export type Shipment = {
  shipment_id: string
  carrier_id: string
  service_code: string
  ship_to: ShipStationAddress
  return_to?: ShipStationAddress
  is_return?: boolean
  ship_from: ShipStationAddress
  items?: [
    {
      name?: string
      quantity?: number
      sku?: string
    }
  ]
  warehouse_id?: string
  shipment_status: "pending" | "processing" | "label_purchased" | "cancelled"
  [k: string]: unknown
}

export type PurchaseLabelRequest = {
  shipment?: Omit<Shipment, "shipment_id" | "shipment_status">
  is_return_label?: boolean
  outbound_label_id?: string
}

export type Label = {
  label_id: string
  status: "processing" | "completed" | "error" | "voided"
  shipment_id: string
  ship_date: Date
  shipment_cost: {
    currency: string
    amount: number
  }
  insurance_cost: {
    currency: string
    amount: number
  }
  confirmation_amount: {
    currency: string
    amount: number
  }
  tracking_number: string
  is_return_label: boolean
  carrier_id: string
  service_code: string
  trackable: string
  tracking_status: "unknown" | "in_transit" | "error" | "delivered"
  label_download: {
    href: string
    pdf: string
    png: string
    zpl: string
  }
}

export type VoidLabelResponse = {
  approved: boolean
  message: string
  reason_code?: string
}