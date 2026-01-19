import {
  createStep,
  StepResponse
} from "@medusajs/framework/workflows-sdk"
import DigitalProductModuleService from "../../../modules/digital-product/service"
import { DIGITAL_PRODUCT_MODULE } from "../../../modules/digital-product"
import { MediaType } from "../../../modules/digital-product/types"

export type CreateDigitalProductMediaInput = {
  type: MediaType
  fileId: string
  mimeType: string
  digital_product_id: string
}

type CreateDigitalProductMediasStepInput = {
  medias: CreateDigitalProductMediaInput[]
}

const createDigitalProductMediasStep = createStep(
  "create-digital-product-medias",
  async ({ 
    medias
  }: CreateDigitalProductMediasStepInput, { container }) => {
    const digitalProductModuleService: DigitalProductModuleService = 
      container.resolve(DIGITAL_PRODUCT_MODULE)

    const digitalProductMedias = await digitalProductModuleService
      .createDigitalProductMedias(medias)

    return new StepResponse({
      digital_product_medias: digitalProductMedias
    }, {
      digital_product_medias: digitalProductMedias
    })
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const digitalProductModuleService: DigitalProductModuleService = 
      container.resolve(DIGITAL_PRODUCT_MODULE)
    
    await digitalProductModuleService.deleteDigitalProductMedias(
      data.digital_product_medias.map((media) => media.id)
    )
  }
)

export default createDigitalProductMediasStep