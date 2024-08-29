import { z } from "zod";

export const restaurantSchema = z.object({
  name: z.string(),
  handle: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  image_url: z.string().optional(),
});