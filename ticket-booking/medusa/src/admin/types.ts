export enum RowType {
  PREMIUM = "premium",
  BALCONY = "balcony",
  STANDARD = "standard",
  VIP = "vip"
}

export interface VenueRow {
  id: string
  row_number: string
  row_type: RowType
  seat_count: number
  venue_id: string
  created_at: string
  updated_at: string
}

export interface Venue {
  id: string
  name: string
  address?: string
  rows: VenueRow[]
  created_at: string
  updated_at: string
}

export interface CreateVenueRequest {
  name: string
  address?: string
  rows: {
    row_number: string
    row_type: RowType
    seat_count: number
  }[]
}

export interface VenuesResponse {
  venues: Venue[]
  count: number
  limit: number
  offset: number
}

export interface TicketProduct {
  id: string
  product_id: string
  venue_id: string
  dates: string[]
  venue: {
    id: string
    name: string
    address?: string
  }
  product: {
    id: string
    title: string
  }
  variants: Array<{
    id: string
    row_type: string
  }>
  created_at: string
  updated_at: string
}