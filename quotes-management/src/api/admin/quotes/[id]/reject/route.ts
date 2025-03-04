import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminRejectQuoteType } from "../../validators";
import { merchantRejectQuoteWorkflow } from "../../../../../workflows/merchant-reject-quote";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminRejectQuoteType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await merchantRejectQuoteWorkflow(req.scope).run({
    input: {
      quote_id: id,
      ...req.validatedBody,
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
