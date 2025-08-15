import { createWorkflow, parallelize, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep, dismissRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { createProductBuilderStep } from "./steps/create-product-builder"
import { prepareProductBuilderCustomFieldsStep } from "./steps/prepare-product-builder-custom-fields"
import { createProductBuilderCustomFieldsStep } from "./steps/create-product-builder-custom-fields"
import { updateProductBuilderCustomFieldsStep } from "./steps/update-product-builder-custom-fields"
import { deleteProductBuilderCustomFieldsStep } from "./steps/delete-product-builder-custom-fields"
import { prepareProductBuilderComplementaryProductsStep } from "./steps/prepare-product-builder-complementary-products"
import { createProductBuilderComplementaryProductsStep } from "./steps/create-product-builder-complementary-products"
import { deleteProductBuilderComplementaryProductsStep } from "./steps/delete-product-builder-complementary-products"
import { prepareProductBuilderAddonsStep } from "./steps/prepare-product-builder-addons"
import { createProductBuilderAddonsStep } from "./steps/create-product-builder-addons"
import { deleteProductBuilderAddonsStep } from "./steps/delete-product-builder-addons"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { PRODUCT_BUILDER_MODULE } from "../modules/product-builder"

export type UpsertProductBuilderWorkflowInput = {
  product_id: string
  custom_fields?: Array<{
    id?: string
    name: string
    type: string
    is_required?: boolean
    description?: string | null
  }>
  complementary_products?: Array<{
    id?: string
    product_id: string
  }>
  addon_products?: Array<{
    id?: string
    product_id: string
  }>
}

export const upsertProductBuilderWorkflow = createWorkflow(
  "upsert-product-builder",
  (input: UpsertProductBuilderWorkflowInput) => {
    const { data: existingProductBuilder } = useQueryGraphStep({
      entity: "product_builder",
      fields: [
        "id",
      ],
      filters: {
        product_id: input.product_id
      }
    })

    const productBuilder = when({
      existingProductBuilder
      // @ts-ignore
    }, ({ existingProductBuilder }) => existingProductBuilder.length === 0)
      .then(() => {
        const productBuilder = createProductBuilderStep({
          product_id: input.product_id
        })

        const productBuilderLink = transform({
          productBuilder,
        }, (data) => [{
          [PRODUCT_BUILDER_MODULE]: {
            product_builder_id: data.productBuilder!.id
          },
          [Modules.PRODUCT]: {
            product_id: data.productBuilder!.product_id
          }
        }])

        const link = createRemoteLinkStep(productBuilderLink)

        return productBuilder
      })
    
    const productBuilderId = transform({
      existingProductBuilder, productBuilder
    }, (data) => data.productBuilder?.id || data.existingProductBuilder[0]!.id)

    // Prepare custom fields operations
    const {
      toCreate: customFieldsToCreate,
      toUpdate: customFieldsToUpdate,
      toDelete: customFieldsToDelete
    } = prepareProductBuilderCustomFieldsStep({
      product_builder_id: productBuilderId,
      custom_fields: input.custom_fields
    })

    parallelize(
      createProductBuilderCustomFieldsStep({
        custom_fields: customFieldsToCreate
      }),
      updateProductBuilderCustomFieldsStep({
        custom_fields: customFieldsToUpdate
      }),
      deleteProductBuilderCustomFieldsStep({
        custom_fields: customFieldsToDelete
      })
    )

    // Prepare complementary products operations
    const {
      toCreate: complementaryProductsToCreate,
      toDelete: complementaryProductsToDelete
    } = prepareProductBuilderComplementaryProductsStep({
      product_builder_id: productBuilderId,
      complementary_products: input.complementary_products
    })

    const [
      createdComplementaryProducts,
      deletedComplementaryProducts
    ] = parallelize(
      createProductBuilderComplementaryProductsStep({
        complementary_products: complementaryProductsToCreate
      }),
      deleteProductBuilderComplementaryProductsStep({
        complementary_products: complementaryProductsToDelete
      })
    )

    // Create remote links for complementary products
    const {
      complementaryProductLinks,
      deletedComplementaryProductLinks
    } = transform({
      createdComplementaryProducts,
      deletedComplementaryProducts
    }, (data) => {
      return {
        complementaryProductLinks: data.createdComplementaryProducts.map((item) => ({
          [PRODUCT_BUILDER_MODULE]: {
            product_builder_complementary_id: item.id
          },
          [Modules.PRODUCT]: {
            product_id: item.product_id
          },
        })),
        deletedComplementaryProductLinks: data.deletedComplementaryProducts.map((item) => ({
          [PRODUCT_BUILDER_MODULE]: {
            product_builder_complementary_id: item.id
          },
          [Modules.PRODUCT]: {
            product_id: item.product_id
          },
        }))
      }
    })

    when({
      complementaryProductLinks
    }, ({ complementaryProductLinks }) => complementaryProductLinks.length > 0)
      .then(() => {
        createRemoteLinkStep(complementaryProductLinks).config({
          name: "create-complementary-product-links"
        })
      })

    when({
      deletedComplementaryProductLinks
    }, ({ deletedComplementaryProductLinks }) => deletedComplementaryProductLinks.length > 0)
      .then(() => {
        dismissRemoteLinkStep(deletedComplementaryProductLinks)
      })

    // Prepare addons operations
    const {
      toCreate: addonsToCreate,
      toDelete: addonsToDelete
    } = prepareProductBuilderAddonsStep({
      product_builder_id: productBuilderId,
      addon_products: input.addon_products
    })

    const [createdAddons, deletedAddons] = parallelize(
      createProductBuilderAddonsStep({
        addon_products: addonsToCreate
      }),
      deleteProductBuilderAddonsStep({
        addon_products: addonsToDelete
      })
    )

    // Create remote links for addon products
    const {
      addonProductLinks,
      deletedAddonProductLinks
    } = transform({
      createdAddons,
      deletedAddons
    }, (data) => {
      return {
        addonProductLinks: data.createdAddons.map((item) => ({
          [PRODUCT_BUILDER_MODULE]: {
            product_builder_addon_id: item.id
          },
          [Modules.PRODUCT]: {
            product_id: item.product_id
          },
        })),
        deletedAddonProductLinks: data.deletedAddons.map((item) => ({
          [PRODUCT_BUILDER_MODULE]: {
            product_builder_addon_id: item.id
          },
          [Modules.PRODUCT]: {
            product_id: item.product_id
          },
        }))
      }
    })

    when({
      addonProductLinks
    }, ({ addonProductLinks }) => addonProductLinks.length > 0)
      .then(() => {
        createRemoteLinkStep(addonProductLinks).config({
          name: "create-addon-product-links"
        })
      })

    when({
      deletedAddonProductLinks
    }, ({ deletedAddonProductLinks }) => deletedAddonProductLinks.length > 0)
      .then(() => {
        dismissRemoteLinkStep(deletedAddonProductLinks).config({
          name: "dismiss-addon-product-links"
        })
      })

    const { data: productBuilders } = useQueryGraphStep({
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
        product_id: input.product_id
      }
    }).config({ name: "get-product-builder" })

    // @ts-ignore
    return new WorkflowResponse({
      product_builder: productBuilders[0]
    })
  }
)
