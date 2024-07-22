import {
  MedusaContainer
} from "@medusajs/types"
import DigitalProductModuleService from "../modules/digital-product/service"
import { DIGITAL_PRODUCT_MODULE } from "../modules/digital-product"
import { OrderStatus } from "../modules/digital-product/types"

export default async function createDigitalFulfillment(
  container: MedusaContainer
) {
  const digitalProductModuleService: DigitalProductModuleService = container
    .resolve(DIGITAL_PRODUCT_MODULE)

  const limit = 20
  let page = 0
  let pagesCount = 0

  do {
    const [
      digitalProductOrders, 
      count
    ] = await digitalProductModuleService.listAndCountDigitalProductOrders({
      status: OrderStatus.PENDING
    }, {
      skip: page * limit,
      take: limit
    })

    // TODO create fulfillment for the digital product's items.

    if (!pagesCount) {
      pagesCount = count / limit
    }

    page++
    
  } while (false)
}

export const config = {
  name: "create-digital-fulfillment",
  schedule: "*/5 * * * *", // Check every 5 minutes
};