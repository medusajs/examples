import { 
  createWorkflow,
  transform,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import {
  CreateProductWorkflowInputDTO
} from "@medusajs/framework/types"
import { 
  createProductsWorkflow,
  createRemoteLinkStep
} from "@medusajs/medusa/core-flows"
import { 
  Modules
} from "@medusajs/framework/utils"
import createDigitalProductStep, { 
  CreateDigitalProductStepInput
} from "./steps/create-digital-product"
import createDigitalProductMediasStep, { 
  CreateDigitalProductMediaInput
} from "./steps/create-digital-product-medias"
import { DIGITAL_PRODUCT_MODULE } from "../../modules/digital-product"

type CreateDigitalProductWorkflowInput = {
  digital_product: CreateDigitalProductStepInput & {
    medias: Omit<CreateDigitalProductMediaInput, "digital_product_id">[]
  }
  product: CreateProductWorkflowInputDTO
}

const createDigitalProductWorkflow = createWorkflow(
  "create-digital-product",
  (input: CreateDigitalProductWorkflowInput) => {
    const product = createProductsWorkflow.runAsStep({
      input: {
        products: [input.product]
      }
    })

    const digitalProductData = transform(
      input,
      (data) => ({
        name: data.digital_product.name
      })
    )

    const { digital_product } = createDigitalProductStep(
      digitalProductData
    )

    const { digital_product_medias } = createDigitalProductMediasStep(
      transform({
        digital_product,
        input
      },
      (data) => ({
        medias: data.input.digital_product.medias.map((media) => ({
          ...media,
          digital_product_id: data.digital_product.id
        }))
      })
      )
    )

    createRemoteLinkStep([{
      [DIGITAL_PRODUCT_MODULE]: {
        digital_product_id: digital_product.id
      },
      [Modules.PRODUCT]: {
        product_variant_id: product[0].variants[0].id
      }
    }])

    const returnData = transform(
      {
        digital_product,
        digital_product_medias
      },
      (data) => ({
        digital_product: {
          ...data.digital_product,
          medias: data.digital_product_medias
        }
      })
    )

    return new WorkflowResponse(returnData)
  }
)

export default createDigitalProductWorkflow