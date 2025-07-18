import { HttpTypes } from "@medusajs/framework/types"

export interface PreorderVariant {
  id: string
  variant_id: string
  available_date: string
  status: "enabled" | "disabled"
  created_at: string
  updated_at: string
}

export interface Preorder {
  id: string
  order_id: string
  status: "pending" | "fulfilled" | "cancelled"
  created_at: string
  updated_at: string
  item: PreorderVariant & {
    product_variant?: HttpTypes.AdminProductVariant
  }
  order?: HttpTypes.AdminOrder
}

export interface PreordersResponse {
  preorders: Preorder[]
}

export interface PreorderVariantResponse {
  variant: HttpTypes.AdminProductVariant & {
    preorder_variant?: PreorderVariant
  }
}

export interface CreatePreorderVariantData {
  available_date: Date
}
