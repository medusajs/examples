import { z } from "@medusajs/framework/zod";

export const createUserSchema = z
  .object({
    email: z.email(),
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string(),
    avatar_url: z.string().optional(),
    restaurant_id: z.string().optional(),
    actor_type: z.enum(["restaurant", "driver"]),
  })