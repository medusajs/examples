// import { MedusaError } from "@medusajs/framework/utils"
// import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
// import { InferTypeOf } from "@medusajs/framework/types"
// import { PreorderVariant } from "../../modules/preorder/models/preorder-variant"

// function isPreorderVariant(preorderVariant: InferTypeOf<typeof PreorderVariant> | undefined) {
//   if (!preorderVariant) {
//     return false
//   }
//   return preorderVariant.status === "enabled" && preorderVariant.available_date > new Date()
// }

// addToCartWorkflow.hooks.validate(
//   (async ({ input, cart }, { container }) => {
//     const query = container.resolve("query")

//     const { data: itemsInCart } = await query.graph({
//       entity: "line_item",
//       fields: ["variant.*", "variant.preorder_variant.*"],
//       filters: {
//         cart_id: cart.id,
//       }
//     })

//     if (!itemsInCart.length) {
//       return
//     }
    
//     const { data: variantsToAdd } = await query.graph({
//       entity: "variant",
//       fields: ["preorder_variant.*"],
//       filters: {
//         id: input.items.map((item) => item.variant_id).filter(Boolean) as string[],
//       }
//     })

//     const cartHasPreorderVariants = itemsInCart.some(
//       (item) => isPreorderVariant(item.variant?.preorder_variant as InferTypeOf<typeof PreorderVariant>)
//     )

//     const newItemsHavePreorderVariants = variantsToAdd.some(
//       (variant) => isPreorderVariant(variant.preorder_variant as InferTypeOf<typeof PreorderVariant>)
//     )

//     if (cartHasPreorderVariants !== newItemsHavePreorderVariants) {
//       throw new MedusaError(
//         MedusaError.Types.INVALID_DATA,
//         "The cart must either contain only preorder variants, or available variants."
//       )
//     }
//   })
// )