import { OrderDTO } from "@medusajs/types";
import { Modules } from "@medusajs/utils";
import { StepResponse, createStep } from "@medusajs/workflows-sdk";

export const createFulfillmentStep = createStep(
  "create-fulfillment-step",
  async function (order: OrderDTO, { container }) {
    const fulfillmentModuleService = container.resolve(
      Modules.FULFILLMENT
    );

    const items = order.items?.map((lineItem) => ({
      title: lineItem.title,
      sku: lineItem.variant_sku || "",
      quantity: lineItem.quantity,
      barcode: lineItem.variant_barcode || "",
      line_item_id: lineItem.id,
    }));

    const fulfillment = await fulfillmentModuleService.createFulfillment({
      provider_id: "manual_manual",
      location_id: "1",
      delivery_address: order.shipping_address!,
      items: items || [],
      labels: [],
      order,
    });

    return new StepResponse(fulfillment, fulfillment.id);
  },
  function (id: string, { container }) {
    const fulfillmentModuleService = container.resolve(
      Modules.FULFILLMENT
    );

    return fulfillmentModuleService.cancelFulfillment(id);
  }
);
