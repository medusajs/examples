import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AcceptQuoteType } from "../../validators";
import { customerAcceptQuoteWorkflow } from "../../../../../workflows";

export const POST = async (
  req: AuthenticatedMedusaRequest<AcceptQuoteType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await customerAcceptQuoteWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
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
      ...req.queryConfig,
    },
    { throwIfKeyNotFound: true }
  );

  return res.json({ quote });
};
