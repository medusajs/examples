import { MedusaError } from "@medusajs/framework/utils";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";

addToCartWorkflow.hooks.validate(
  async ({ input }, { container }) => {
    const query = container.resolve("query");
    const { data: variants } = await query.graph({
      entity: "variant",
      fields: ["product.*"],
      filters: {
        id: input.items.map((item) => item.variant_id).filter(Boolean) as string[],
      },
    })
    for (const item of input.items) {
      const variant = variants.find((v) => v.id === item.variant_id);
      if (!variant?.product?.metadata?.is_personalized) {
        continue;
      }
      if (
        !item.metadata?.height || !item.metadata.width ||
        isNaN(Number(item.metadata.height)) || isNaN(Number(item.metadata.width))
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Please set height and width metadata for each item."
        )
      }
    }
  }
)