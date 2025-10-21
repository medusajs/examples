import { CreateOrderShippingMethodDTO } from "@medusajs/framework/types";
import {
  Modules,
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
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

    if (!cart) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Cart for delivery with id: ${deliveryId} was not found`
      )
    }

    const orderModuleService = container.resolve(Modules.ORDER);

    const order = await orderModuleService.createOrders({
      currency_code: cart.currency_code,
      email: cart.email || "",
      shipping_address: {
        first_name: cart.shipping_address?.first_name || "",
        last_name: cart.shipping_address?.last_name || "",
        address_1: cart.shipping_address?.address_1 || "",
        address_2: cart.shipping_address?.address_2 || "",
        city: cart.shipping_address?.city || "",
        province: cart.shipping_address?.province || "",
        postal_code: cart.shipping_address?.postal_code || "",
        country_code: cart.shipping_address?.country_code || "",
        phone: cart.shipping_address?.phone || "",
      },
      billing_address: {
        first_name: cart.billing_address?.first_name || "",
        last_name: cart.billing_address?.last_name || "",
        address_1: cart.billing_address?.address_1 || "",
        address_2: cart.billing_address?.address_2 || "",
        city: cart.billing_address?.city || "",
        province: cart.billing_address?.province || "",
        postal_code: cart.billing_address?.postal_code || "",
        country_code: cart.billing_address?.country_code || "",
        phone: cart.billing_address?.phone || "",
      },
      items: cart.items.map((item) => ({
        title: item!.title,
        quantity: item!.quantity,
        variant_id: item!.variant_id || "",
        unit_price: item!.unit_price,
        metadata: item!.metadata || undefined,
        product_id: item!.product_id || "",
      })),
      region_id: cart.region_id || "",
      customer_id: cart.customer_id || "",
      sales_channel_id: cart.sales_channel_id || "",
      shipping_methods:
        cart.shipping_methods?.map((sm): CreateOrderShippingMethodDTO => ({
          shipping_option_id: sm?.shipping_option_id || "",
          data: sm?.data || {},
          name: sm?.name || "",
          amount: sm?.amount || 0,
          order_id: "", // will be set internally
        })) || [],
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
  async (data, { container }) => {
    if (!data) {
      return
    }
    const orderService = container.resolve(Modules.ORDER);

    await orderService.softDeleteOrders([data.orderId]);
  }
);
