import { CreateOrderShippingMethodDTO } from "@medusajs/types";
import {
  Modules,
  ContainerRegistrationKeys,
} from "@medusajs/utils";
import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { DELIVERY_MODULE } from "../../../modules/delivery";

export const createOrderStep = createStep(
  "create-order-step",
  async function (deliveryId: string, { container }) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: [delivery] } = await query.graph({
      entity: "deliveries",
      fields: [
        "id", 
        "cart.*",
        "cart.shipping_address.*",
        "cart.billing_address.*",
        "cart.items.*",
        "cart.shipping_methods.*"
      ],
      filters: {
        id: deliveryId,
      },
    });

    const { cart } = delivery

    const orderModuleService = container.resolve(Modules.ORDER);

    const order = await orderModuleService.createOrders({
      currency_code: cart.currency_code,
      email: cart.email,
      shipping_address: cart.shipping_address,
      billing_address: cart.billing_address,
      items: cart.items,
      region_id: cart.region_id,
      customer_id: cart.customer_id,
      sales_channel_id: cart.sales_channel_id,
      shipping_methods:
        cart.shipping_methods as unknown as CreateOrderShippingMethodDTO[],
    });

    const linkDef = [{
      [DELIVERY_MODULE]: {
        delivery_id: delivery.id as string,
      },
      [Modules.ORDER]: {
        order_id: order.id,
      },
    }]

    return new StepResponse({ 
      order,
      linkDef
    }, {
      orderId: order.id,
    });
  },
  async ({ orderId }, { container }) => {
    const orderService = container.resolve(Modules.ORDER);

    await orderService.softDeleteOrders([orderId]);
  }
);
