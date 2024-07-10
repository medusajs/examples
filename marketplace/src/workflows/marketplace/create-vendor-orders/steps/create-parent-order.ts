import { 
  createStep,
  StepResponse,
} from "@medusajs/workflows-sdk"
import { completeCartWorkflow } from "@medusajs/core-flows"

type StepInput = {
  cart_id: string
}

const createParentOrderStep = createStep(
  "create-parent-order",
  async ({ cart_id }: StepInput, { container }) => {
    const { result } = await completeCartWorkflow(container)
      .run({
        input: {
          id: cart_id
        }
      })

    return new StepResponse({
      order: result
    })
  }
)

export default createParentOrderStep