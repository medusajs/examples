import { StoreProductWithPayload } from "../../types/global";

export function getProductImages(product: StoreProductWithPayload) {
  return product?.payload_product?.images?.map((image) => ({
    id: image.id,
    url: formatPayloadImageUrl(image.image.url),
  })) || product.images || []
}

export function formatPayloadImageUrl(url: string): string {
  return url.replace(/^\/api\/media\/file/, "")
}