import {
  CartLineItemDTO,
  OrderLineItemDTO,
  CartDTO,
  OrderDTO,
} from "@medusajs/types";
import DeliveryModuleService from "../service";

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

export interface Delivery {
  id: string;
  transaction_id: string;
  driver_id?: string;
  delivered_at?: Date;
  delivery_status: DeliveryStatus;
  created_at: Date;
  updated_at: Date;
  eta?: Date;
  items: DeliveryItem[];
  cart?: CartDTO;
  order?: OrderDTO;
}

export type DeliveryItem = (CartLineItemDTO | OrderLineItemDTO) & {
  quantity: number;
}

export interface UpdateDelivery extends Partial<Delivery> {
  id: string;
}

declare module "@medusajs/types" {
  export interface ModuleImplementations {
    deliveryModuleService: DeliveryModuleService;
  }
}
