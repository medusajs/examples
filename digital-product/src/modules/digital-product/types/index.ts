export enum MediaType {
  MAIN = "main",
  PREVIEW = "preview"
}

export enum OrderStatus {
  PENDING = "pending",
  SENT = "sent"
}

export type DigitalProductData = {
  id: string
  name: string
  medias?: DigitalProductMediaData[]
}

export type DigitalProductMediaData = {
  id: string
  type: MediaType
  fileId: string
  mimeType: string
}