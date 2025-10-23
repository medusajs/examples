export type CategoryImage = {
  id?: string
  url: string
  type: "thumbnail" | "image"
  file_id: string
  category_id?: string
}

export type UploadedFile = {
  id: string
  url: string
  type?: "thumbnail" | "image"
}