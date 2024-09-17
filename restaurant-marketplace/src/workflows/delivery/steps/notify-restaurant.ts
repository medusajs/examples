import {
  Modules,
  ContainerRegistrationKeys,
} from "@medusajs/utils";
import { createStep } from "@medusajs/workflows-sdk";

export const notifyRestaurantStepId = "notify-restaurant-step";
export const notifyRestaurantStep = createStep(
  {
    name: notifyRestaurantStepId,
    async: true,
    timeout: 60 * 15,
    maxRetries: 2,
  },
  async function (deliveryId: string, { container }) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: [delivery] } = await query.graph({
      entity: "deliveries",
      fields: ["id", "restaurant.id"],
      filters: {
        id: deliveryId,
      },
    })

    const eventBus = container.resolve(Modules.EVENT_BUS);

    await eventBus.emit({
      name: "notify.restaurant",
      data: {
        restaurant_id: delivery.restaurant.id,
        delivery_id: delivery.id,
      },
    });
  }
);
