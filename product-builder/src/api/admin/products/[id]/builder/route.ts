import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { z } from "zod"
import { upsertProductBuilderWorkflow } from "../../../../../workflows/upsert-product-builder"

export const UpsertProductBuilderSchema = z.object({
  custom_fields: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    type: z.string(),
    is_required: z.boolean().optional().default(false),
    description: z.string().nullable().optional(),
  })).optional(),
  complementary_products: z.array(z.object({
    id: z.string().optional(),
    product_id: z.string(),
  })).optional(),
  addon_products: z.array(z.object({
    id: z.string().optional(),
    product_id: z.string(),
  })).optional(),
})

export const POST = async (
  req: AuthenticatedMedusaRequest<typeof UpsertProductBuilderSchema>,
  res: MedusaResponse
) => {
  const { result } = await upsertProductBuilderWorkflow(req.scope)
    .run({
      input: {
        product_id: req.params.id,
        ...req.validatedBody
      }
    })

  res.json({
    product_builder: result.product_builder
  })
}


export const GET = async (
  req: AuthenticatedMedusaRequest<{ id: string }>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")
  
  const { data: productBuilders } = await query.graph({
    entity: "product_builder",
    fields: [
      "id",
      "product_id", 
      "custom_fields.*",
      "complementary_products.*",
      "complementary_products.product.*",
      "addons.*",
      "addons.product.*",
      "created_at",
      "updated_at"
    ],
    filters: {
      product_id: req.params.id
    }
  })

  if (productBuilders.length === 0) {
    return res.status(404).json({
      message: `Product builder configuration not found for product ID: ${req.params.id}`
    })
  }

  res.json({
    product_builder: productBuilders[0]
  })
}
