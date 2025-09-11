import { HttpTypes } from "@medusajs/types"

export interface TicketProductAvailability {
  date: string
  row_types: {
    row_type: string
    total_seats: number
    available_seats: number
    sold_out: boolean
  }[]
  sold_out: boolean
}

export interface TicketProduct {
  id: string
  product_id: string
  venue: {
    id: string
    name: string
    address: string
    rows: Array<{
      id: string
      row_number: string
      row_type: string
      seat_count: number
    }>
  }
  dates: string[]
}

export interface TicketProductAvailabilityData {
  ticket_product: TicketProduct
  availability: TicketProductAvailability[]
}

export interface TicketProductSeatsData {
  venue: {
    id: string
    name: string
    address: string
    rows: Array<{
      id: string
      row_number: string
      row_type: string
      seat_count: number
    }>
  }
  date: string
  seat_map: {
    row_number: string
    row_type: string
    seats: {
      number: string
      is_purchased: boolean
      variant_id: string | null
    }[]
  }[]
}

/**
 * Check if a product is a ticket product by looking for the ticket_product property
 */
export function isTicketProduct(product: HttpTypes.StoreProduct): boolean {
  return !!(product as any).ticket_product
}
