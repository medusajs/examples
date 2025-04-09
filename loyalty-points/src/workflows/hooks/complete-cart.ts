import { completeCartWorkflow } from "@medusajs/medusa/core-flows";
import LoyaltyModuleService from "../../modules/loyalty/service";
import { LOYALTY_MODULE } from "../../modules/loyalty";
import { CartData, getCartLoyaltyPromotion } from "../../utils/promo";
import { MedusaError } from "@medusajs/framework/utils";

completeCartWorkflow.hooks.validate(
  async ({ cart }, { container }) => {
    const query = container.resolve("query")
    const loyaltyModuleService: LoyaltyModuleService = container.resolve(
      LOYALTY_MODULE
    )

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id", 
        "promotions.*", 
        "customer.*", 
        "promotions.rules.*", 
        "promotions.rules.values.*", 
        "promotions.application_method.*", 
        "metadata"
      ],
      filters: {
        id: cart.id
      }
    }, {
      throwIfKeyNotFound: true
    })

    const loyaltyPromo = getCartLoyaltyPromotion(carts[0] as unknown as CartData)

    if (!loyaltyPromo) {
      return
    }
    
    const customerLoyaltyPoints = await loyaltyModuleService.getPoints(carts[0].customer!.id)
    const requiredPoints = await loyaltyModuleService.calculatePointsFromAmount(loyaltyPromo.application_method!.value as number)

    if (customerLoyaltyPoints < requiredPoints) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Customer does not have enough loyalty points. Required: ${requiredPoints}, Available: ${customerLoyaltyPoints}`
      )
    }
  }
)