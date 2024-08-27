import { CreateOrderShippingMethodDTO } from "@medusajs/types";
import {
  ModuleRegistrationName,
  Modules,
  remoteQueryObjectFromString,
} from "@medusajs/utils";
import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { DELIVERY_MODULE } from "../../../modules/delivery";

export const createOrderStep = createStep(
  "create-order-step",
  async function (deliveryId: string, { container }) {
    const remoteQuery = container.resolve("remoteQuery");

    const deliveryQuery = remoteQueryObjectFromString({
      entryPoint: "deliveries",
      variables: {
        filters: {
          id: deliveryId,
        },
      },
      fields: [
        "id", 
        "cart.*",
        "cart.shipping_address.*",
        "cart.billing_address.*",
        "cart.items.*",
        "cart.shipping_methods.*"
      ],
    });

    const delivery = await remoteQuery(deliveryQuery).then((res) => res[0]);

    const { cart } = delivery

    const orderModuleService = container.resolve(ModuleRegistrationName.ORDER);

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
    const orderService = container.resolve(ModuleRegistrationName.ORDER);

    await orderService.softDeleteOrders([orderId]);
  }
);
