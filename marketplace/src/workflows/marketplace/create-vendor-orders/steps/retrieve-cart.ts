import { 
  createStep,
  StepResponse,
} from "@medusajs/workflows-sdk"
import { ModuleRegistrationName } from "@medusajs/utils"
import { ICartModuleService } from "@medusajs/types"

type StepInput = {
  cart_id: string
}

const retrieveCartStep = createStep(
  "retrieve-cart",
  async ({ cart_id }: StepInput, { container }) => {
    const cartModuleService: ICartModuleService = container
      .resolve(ModuleRegistrationName.CART)

    const cart = await cartModuleService.retrieveCart(cart_id, {
      relations: ["items"]
    })

    return new StepResponse({
      cart
    })
  }
)

export default retrieveCartStep