import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework/http";
import { 
  sanitySyncProductsWorkflow
} from "../../../../../../workflows/sanity-sync-products";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { transaction } = await sanitySyncProductsWorkflow(req.scope)
    .run({
      input: { product_ids: [req.params.id] },
    });

  res.json({ transaction_id: transaction.transactionId });
};
