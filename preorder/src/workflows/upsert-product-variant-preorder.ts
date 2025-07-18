import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep, useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { updatePreorderVariantStep } from "./steps/update-preorder-variant";
import { createPreorderVariantStep } from "./steps/create-preorder-variant";
import { PREORDER_MODULE } from "../modules/preorder";
import { Modules } from "@medusajs/framework/utils";
import { PreorderVariantStatus } from "../modules/preorder/models/preorder-variant";

type WorkflowInput = {
  variant_id: string;
  available_date: Date;
}

export const upsertProductVariantPreorderWorkflow = createWorkflow(
  "upsert-product-variant-preorder",
  (input: WorkflowInput) => {
    // confirm that product variant exists
    useQueryGraphStep({
      entity: "product_variant",
      fields: ["id"],
      filters: {
        id: input.variant_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const { data: preorderVariants } = useQueryGraphStep({
      entity: "preorder_variant",
      fields: ["*"],
      filters: {
        variant_id: input.variant_id
      }
    }).config({ name: "retrieve-preorder-variant" });

    const updatedPreorderVariant = when(
      { preorderVariants }, 
      (data) => data.preorderVariants.length > 0
    ).then(() => {
      const preorderVariant = updatePreorderVariantStep({
        id: preorderVariants[0].id,
        variant_id: input.variant_id,
        available_date: input.available_date,
        status: PreorderVariantStatus.ENABLED,
      })

      return preorderVariant
    })

    const createdPreorderVariant = when(
      { preorderVariants }, 
      (data) => data.preorderVariants.length === 0
    ).then(() => {
      const preorderVariant = createPreorderVariantStep(input)
      
      createRemoteLinkStep([
        {
          [PREORDER_MODULE]: {
            preorder_variant_id: preorderVariant.id
          },
          [Modules.PRODUCT]: {
            product_variant_id: preorderVariant.variant_id
          }
        }
      ])

      return preorderVariant
    })

    const preorderVariant = transform({
      updatedPreorderVariant,
      createdPreorderVariant
    }, (data) => 
      data.createdPreorderVariant || data.updatedPreorderVariant
    )

    return new WorkflowResponse(preorderVariant)
  }
)