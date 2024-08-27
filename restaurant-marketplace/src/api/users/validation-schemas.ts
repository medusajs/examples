import { z } from "zod";

export const createUserSchema = z
  .object({
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string(),
    avatar_url: z.string().optional(),
    restaurant_id: z.string().optional(),
    actor_type: z.ZodEnum.create(["restaurant", "driver"]),
  })