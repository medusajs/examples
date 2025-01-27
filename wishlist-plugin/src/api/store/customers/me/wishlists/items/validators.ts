import { z } from "zod"

export const PostStoreCreateWishlistItem = z.object({
  variant_id: z.string(),
})