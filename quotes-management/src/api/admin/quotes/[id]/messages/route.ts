import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminCreateQuoteMessageType } from "../../validators";
import { createQuoteMessageWorkflow } from "../../../../../workflows";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateQuoteMessageType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await createQuoteMessageWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      admin_id: req.auth_context.actor_id,
      quote_id: id,
    },
  });

  const {
    data: [quote],
  } = await query.graph(
    {
      entity: "quote",
      filters: { id },
      ...req.queryConfig,
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ quote });
};
