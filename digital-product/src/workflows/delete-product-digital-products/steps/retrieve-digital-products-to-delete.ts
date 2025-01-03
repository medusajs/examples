import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import DigitalProductVariantLink from "../../../links/digital-product-variant"

type RetrieveDigitalProductsToDeleteStepInput = {
  product_id: string
}

export const retrieveDigitalProductsToDeleteStep = createStep(
  "retrieve-digital-products-to-delete",
  async ({ product_id }: RetrieveDigitalProductsToDeleteStepInput, { container }) => {
    const productService = container.resolve("product")
    const query = container.resolve("query")

    const productVariants = await productService.listProductVariants({
      product_id: product_id
    }, {
      withDeleted: true
    })

    const { data } = await query.graph({
      entity: DigitalProductVariantLink.entryPoint,
      fields: ["digital_product.*"],
      filters: {
        product_variant_id: productVariants.map((v) => v.id)
      }
    })

    const digitalProductIds = data.map((d) => d.digital_product.id)

    return new StepResponse(digitalProductIds)
  }
)