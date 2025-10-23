import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createCategoryImagesWorkflow } from "../../../../../workflows/create-category-images"
import { z } from "zod"

export const CreateCategoryImagesSchema = z.object({
  images: z.array(
    z.object({
      type: z.enum(["thumbnail", "image"]),
      url: z.string(),
      file_id: z.string(),
    })
  ).min(1, "At least one image is required"),
})

type CreateCategoryImagesInput = z.infer<typeof CreateCategoryImagesSchema>

export async function POST(
  req: MedusaRequest<CreateCategoryImagesInput>,
  res: MedusaResponse
): Promise<void> {
  const { category_id } = req.params
  const { images } = req.validatedBody

  // Add category_id to each image
  const category_images = images.map((image) => ({
    ...image,
    category_id,
  }))

  const { result } = await createCategoryImagesWorkflow(req.scope).run({
    input: {
      category_images,
    },
  })

  res.status(200).json({ category_images: result })
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { category_id } = req.params
  const query = req.scope.resolve("query")

  const { data: categoryImages } = await query.graph({
    entity: "product_category_image",
    fields: ["*"],
    filters: {
      category_id,
    },
  })

  res.status(200).json({ category_images: categoryImages })
}

