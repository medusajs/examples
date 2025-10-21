import { InferTypeOf } from "@medusajs/framework/types";
import { Restaurant } from "../models/restaurant";

export type CreateRestaurant = Omit<
  InferTypeOf<typeof Restaurant>, "id" | "admins"
>
