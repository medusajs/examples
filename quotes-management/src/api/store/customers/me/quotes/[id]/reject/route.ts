import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { customerRejectQuoteWorkflow } from "../../../../../../../workflows/customer-reject-quote";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params;
  const query = req.scope.resolve(
    ContainerRegistrationKeys.QUERY
  );

  await customerRejectQuoteWorkflow(req.scope).run({
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

  return res.json({ quote });
};
