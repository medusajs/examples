import { 
  createWorkflow, 
  WorkflowResponse,
  transform,
  when
} from "@medusajs/framework/workflows-sdk"
import { 
  addToCartWorkflow, 
  updateLineItemInCartWorkflow, 
  useQueryGraphStep, 
  acquireLockStep, 
  releaseLockStep
} from "@medusajs/medusa/core-flows"
import { 
  validateProductBuilderConfigurationStep
} from "./steps/validate-product-builder-configuration"

type AddProductBuilderToCartInput = {
  cart_id: string
  product_id: string
  variant_id: string
  quantity?: number
  custom_field_values?: Record<string, any>
  complementary_product_variants?: string[] // Array of product IDs
  addon_variants?: string[] // Array of addon product IDs
}

export const addProductBuilderToCartWorkflow = createWorkflow(
  "add-product-builder-to-cart",
  (input: AddProductBuilderToCartInput) => {
    // Step 1: Validate the product builder configuration and selections
    const productBuilder = validateProductBuilderConfigurationStep({
      product_id: input.product_id,
      custom_field_values: input.custom_field_values,
      complementary_product_variants: input.complementary_product_variants,
      addon_variants: input.addon_variants
    })

    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 10,
    })

    // Step 2: Add main product to cart
    const addMainProductData = transform({
      input,
      productBuilder
    }, (data) => ({
        cart_id: data.input.cart_id,
        items: [{
        variant_id: data.input.variant_id,
        quantity: data.input.quantity || 1,
        metadata: {
          product_builder_id: data.productBuilder?.id,
          custom_fields: Object.entries(data.input.custom_field_values || {})
            .map(([field_id, value]) => {
              const field = data.productBuilder?.custom_fields.find((f) => f?.id === field_id)
              return {
                field_id,
                name: field?.name,
                value
              }
            }),
          is_builder_main_product: true
        }
      }]
    }))

    addToCartWorkflow.runAsStep({
      input: addMainProductData
    })

    // Step 4: Get cart after main product is added
    const { data: cartWithMainProduct } = useQueryGraphStep({
      entity: "cart",
      fields: ["*", "items.*"],
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    // Step 5: Add complementary and addon products
    const {
      items_to_add: moreItemsToAdd,
      main_item_update: mainItemUpdate
    } = transform({
      input,
      cartWithMainProduct
    }, (data) => {
      if (!data.input.complementary_product_variants?.length && !data.input.addon_variants?.length) {
        return {}
      }

      // Find the main product line item (most recent addition with builder metadata)
      const mainLineItem = data.cartWithMainProduct[0].items.find((item: any) => 
        item.metadata?.is_builder_main_product === true
      )

      if (!mainLineItem) {
        return {}
      }
      
      return {
        items_to_add: {
          cart_id: data.input.cart_id,
          items: [
            ...(data.input.complementary_product_variants?.map(complementaryProductVariant => ({
              variant_id: complementaryProductVariant,
              quantity: 1,
              metadata: {
                main_product_line_item_id: mainLineItem.id,
              }
            })) || []),
            ...(data.input.addon_variants?.map(addonVariant => ({
              variant_id: addonVariant,
              quantity: 1,
              metadata: {
                main_product_line_item_id: mainLineItem.id,
                is_addon: true
              }
            })) || [])
          ]
        },
        main_item_update: {
          item_id: mainLineItem.id,
          cart_id: data.cartWithMainProduct[0].id,
          update: {
            metadata: {
              cart_line_item_id: mainLineItem.id,
            }
          }
        }
      }
    })

    when({
      moreItemsToAdd,
      mainItemUpdate
    }, ({ 
      moreItemsToAdd,
      mainItemUpdate
    }) => !!moreItemsToAdd && moreItemsToAdd.items.length > 0 && !!mainItemUpdate)
    .then(() => {
      addToCartWorkflow.runAsStep({
        input: {
          cart_id: moreItemsToAdd!.cart_id,
          items: moreItemsToAdd!.items
        }
      })
      // @ts-ignore
      .config({ name: "add-more-products-to-cart" })

      updateLineItemInCartWorkflow.runAsStep({
        input: mainItemUpdate!
      })
    })

    // Step 6: Fetch the final updated cart
    const { data: updatedCart } = useQueryGraphStep({
      entity: "cart",
      fields: ["*", "items.*"],
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    }).config({ name: "get-final-cart" })

    releaseLockStep({
      key: input.cart_id,
    })

    return new WorkflowResponse({
      cart: updatedCart[0]
    })
  }
)
