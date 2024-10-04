import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import zod from "zod";
import { createDeliveryWorkflow } from "../../../workflows/delivery/workflows/create-delivery";
import { handleDeliveryWorkflow } from "../../../workflows/delivery/workflows/handle-delivery";

const schema = zod.object({
  cart_id: zod.string().startsWith("cart_"),
  restaurant_id: zod.string().startsWith("res_"),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedBody = schema.parse(req.body);

  const { result: delivery } = await createDeliveryWorkflow(req.scope).run({
    input: {
      cart_id: validatedBody.cart_id,
      restaurant_id: validatedBody.restaurant_id,
    },
  });

  const { transaction } = await handleDeliveryWorkflow(req.scope).run({
    input: {
      delivery_id: delivery.id,
    },
  });

  return res
    .status(200)
    .json({ message: "Delivery created", delivery, transaction });
}