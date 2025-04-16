import { ProductDTO } from "@medusajs/framework/types"
import { CONTENTFUL_MODULE } from "../../modules/contentful"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import ContentfulModuleService from "../../modules/contentful/service"
import { EntryProps } from "contentful-management"

type StepInput = {
  products: ProductDTO[]
}

export const createProductsContentfulStep = createStep(
  "create-products-contentful-step",
  async (input: StepInput, { container }) => {
    const contentfulModuleService: ContentfulModuleService = 
      container.resolve(CONTENTFUL_MODULE)

    const products: EntryProps[] = []

    try {
      for (const product of input.products) {
        products.push(await contentfulModuleService.createProduct(product))
      }
    } catch(e) {
      return StepResponse.permanentFailure(
        `Error creating products in Contentful: ${e.message}`,
        products
      )
    }

    return new StepResponse(
      products,
      products
    )
  },
  async (products, { container }) => {
    if (!products) {
      return
    }

    const contentfulModuleService: ContentfulModuleService = 
      container.resolve(CONTENTFUL_MODULE)

    for (const product of products) {
      await contentfulModuleService.deleteProduct(product.sys.id)
    }
  }
)
