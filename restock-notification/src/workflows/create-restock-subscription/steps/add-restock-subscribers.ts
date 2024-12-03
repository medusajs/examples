import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RESTOCK_MODULE } from "../../../modules/restock"
import RestockModuleService from "../../../modules/restock/service"

type AddRestockSubscriberStepInput = {
  email: string
  customer_id?: string
  restock_subscription_ids: string[]
}

export const addRestockSubscriberStep = createStep(
  "add-restock-subscriber",
  async ({ email, customer_id, restock_subscription_ids }: AddRestockSubscriberStepInput, { container }) => {
    const restockModuleService: RestockModuleService = container.resolve(RESTOCK_MODULE)

    const restockSubscribers = await restockModuleService.listRestockSubscribers({
      email
    }, {
      relations: ["subscriptions"]
    })
    let restockSubscriber = restockSubscribers.length ? restockSubscribers[0] : undefined
    const changes = {
      operation: restockSubscriber === undefined ? "created" : "updated",
      data: restockSubscriber
    }

    if (restockSubscriber) {
      const customerId = customer_id && restockSubscriber.customer_id !== customer_id ? 
        customer_id : restockSubscriber.customer_id
      const subscriptionIds = [
        ...(restockSubscriber.subscriptions.map((subscription) => subscription.id)),
        ...restock_subscription_ids
      ]
      restockSubscriber = await restockModuleService.updateRestockSubscribers({
        email,
        customer_id: customerId,
        subscriptions: subscriptionIds
      })
    } else {
      restockSubscriber = await restockModuleService.createRestockSubscribers({
        email,
        customer_id,
        subscriptions: restock_subscription_ids
      })
      changes.data = restockSubscriber
    }

    return new StepResponse(restockSubscriber, changes)
  },
  async (changes, { container }) => {
    if (!changes || !changes.data) {
      return
    }

    const restockModuleService: RestockModuleService = container.resolve(RESTOCK_MODULE)

    if (changes.operation === "created") {
      await restockModuleService.deleteRestockSubscribers(changes.data.email)
    } else {
      await restockModuleService.updateRestockSubscribers(changes.data)
    }
  }
)