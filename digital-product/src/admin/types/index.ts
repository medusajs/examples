import { ProductVariantDTO } from "@medusajs/framework/types"

export enum MediaType {
  MAIN = "main",
  PREVIEW = "preview"
}

export type DigitalProductMedia = {
  id: string
  type: MediaType
  fileId: string
  mimeType: string
  digitalProducts?: DigitalProduct
}

export type DigitalProduct = {
  id: string
  name: string
  medias?: DigitalProductMedia[]
  product_variant?:ProductVariantDTO
}