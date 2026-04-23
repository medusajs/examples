import { 
  AdminCreateProduct
} from "@medusajs/medusa/api/admin/products/validators"
import { z } from "@medusajs/framework/zod"
import { MediaType } from "../modules/digital-product/types"

export const createDigitalProductsSchema = z.object({
  name: z.string(),
  medias: z.array(z.object({
    type: z.enum(MediaType),
    file_id: z.string(),
    mime_type: z.string()
  })),
  product: AdminCreateProduct()
})
