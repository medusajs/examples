import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { merchantSendQuoteWorkflow } from "../../../../../workflows/merchant-send-quote";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await merchantSendQuoteWorkflow(req.scope).run({
    input: {
      quote_id: id,
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

  res.json({ quote });
};
