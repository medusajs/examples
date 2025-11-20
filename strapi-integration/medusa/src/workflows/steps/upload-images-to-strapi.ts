import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService from "../../modules/strapi/service"
import { promiseAll } from "@medusajs/framework/utils"

export type UploadImagesToStrapiInput = {
  items: {
    entity_id: string
    url: string
  }[]
}

export const uploadImagesToStrapiStep = createStep(
  "upload-images-to-strapi",
  async ({ items }: UploadImagesToStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    const uploadedImages: {
      entity_id: string
      image_id: number
    }[] = []

    try {
      for (const item of items) {
        // Upload image to Strapi
        const uploadedImageId = await strapiService.uploadImages([item.url])
        uploadedImages.push({
          entity_id: item.entity_id,
          image_id: uploadedImageId[0],
        })
      }
    } catch (error) {
      // If error occurs, pass all uploaded files to compensation
      return StepResponse.permanentFailure(
        strapiService.formatStrapiError(error, 'Failed to upload images to Strapi'),
        { uploadedImages }
      )
    }

    return new StepResponse(
      uploadedImages,
      uploadedImages
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    await promiseAll(
      compensationData.map((uploadedImage) => strapiService.deleteImage(uploadedImage.image_id))
    )
  }
)

