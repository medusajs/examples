import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

export type ValidateProductBuilderConfigurationStepInput = {
  product_id: string
  custom_field_values?: Record<string, any>
  complementary_product_variants?: string[] 
  addon_variants?: string[]
}

export const validateProductBuilderConfigurationStep = createStep(
  "validate-product-builder-configuration",
  async ({
    product_id,
    custom_field_values,
    complementary_product_variants,
    addon_variants
  }: ValidateProductBuilderConfigurationStepInput, { container }) => {
    const query = container.resolve("query")

    const { data: [productBuilder] } = await query.graph({
      entity: "product_builder",
      fields: [
        "*",
        "custom_fields.*",
        "complementary_products.*",
        "complementary_products.product.variants.*",
        "addons.*",
        "addons.product.variants.*"
      ],
      filters: {
        product_id
      }
    })

    if (!productBuilder) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Product builder configuration not found for product ID: ${product_id}`
      )
    }

    if (
      !productBuilder.custom_fields.length && 
      custom_field_values && Object.keys(custom_field_values).length > 0
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Product doesn't support custom fields.`
      )
    }

    for (const field of productBuilder.custom_fields) {
      if (!field) {
        continue
      }
      const value = custom_field_values?.[field.name]
      
      // Check required fields
      if (field.is_required && (!value || value === "")) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Custom field "${field.name}" is required`
        )
      }

      // Validate field type
      if (value !== undefined && value !== "" && field.type === "number" && isNaN(Number(value))) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Custom field "${field.name}" must be a number`
        )
      }
    }

    const invalidComplementary = complementary_product_variants?.filter(
      id => !productBuilder.complementary_products.some((cp) => 
        cp?.product?.variants.some(variant => variant.id === id)
      )
    )
    
    if ((invalidComplementary?.length || 0) > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid complementary product variants: ${invalidComplementary!.join(", ")}`
      )
    }

    const invalidAddons = addon_variants?.filter(
      id => !productBuilder.addons.some(addon => 
        addon?.product?.variants.some(variant => variant.id === id)
      )
    )

    if ((invalidAddons?.length || 0) > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid addon product variants: ${invalidAddons!.join(", ")}`
      )
    }

    return new StepResponse(productBuilder)
  }
)
