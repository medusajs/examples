import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { customerAcceptQuoteWorkflow } from "../../../../../../../workflows/customer-accept-quote";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await customerAcceptQuoteWorkflow(req.scope).run({
    input: {
      quote_id: id,
      customer_id: req.auth_context.actor_id,
    },
  });

  const {
    data: [quote],
  } = await query.graph(
    {
      entity: "quote",
      filters: { id },
      fields: req.queryConfig.fields,
    },
    { throwIfKeyNotFound: true }
  );

  return res.json({ quote });
};
