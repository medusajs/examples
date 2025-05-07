import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework/http";
import { z } from "zod";
import { 
  AdminCreateProduct
} from "@medusajs/medusa/api/admin/products/validators"
import { 
  createBundledProductWorkflow, 
  CreateBundledProductWorkflowInput
} from "../../../workflows/create-bundled-product";

export const PostBundledProductsSchema = z.object({
  title: z.string(),
  product: AdminCreateProduct(),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number(),
  })),
})

type PostBundledProductsSchema = z.infer<typeof PostBundledProductsSchema>

export async function POST(
  req: AuthenticatedMedusaRequest<PostBundledProductsSchema>,
  res: MedusaResponse
) {
  const { result: bundledProduct } = await createBundledProductWorkflow(req.scope)
    .run({
      input: {
        bundle: req.validatedBody,
      } as CreateBundledProductWorkflowInput
    })

  res.json({
    bundled_product: bundledProduct,
  })
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query")
  const { 
    data: bundledProducts, 
    metadata: { count, take, skip } = {} 
  } = await query.graph({
    entity: "bundle",
    ...req.queryConfig
  })

  res.json({
    bundled_products: bundledProducts,
    count: count || 0,
    limit: take || 15,
    offset: skip || 0,
  })
}