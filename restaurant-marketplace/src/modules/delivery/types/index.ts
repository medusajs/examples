import { InferTypeOf } from "@medusajs/framework/types";
import DeliveryModuleService from "../service";
import { Delivery } from "../models/delivery";

export enum DeliveryStatus {
  PENDING = "pending",
  RESTAURANT_DECLINED = "restaurant_declined",
  RESTAURANT_ACCEPTED = "restaurant_accepted",
  PICKUP_CLAIMED = "pickup_claimed",
  RESTAURANT_PREPARING = "restaurant_preparing",
  READY_FOR_PICKUP = "ready_for_pickup",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
}

export type Delivery = InferTypeOf<typeof Delivery>

export type UpdateDelivery = Partial<Omit<Delivery, "driver">> & {
  id: string;
  driver_id?: string
}

declare module "@medusajs/framework/types" {
  export interface ModuleImplementations {
    deliveryModuleService: DeliveryModuleService;
  }
}
