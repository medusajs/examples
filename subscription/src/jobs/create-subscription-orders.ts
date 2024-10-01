import { MedusaContainer } from "@medusajs/framework/types";
import SubscriptionModuleService from "../modules/subscription/service";
import { SUBSCRIPTION_MODULE } from "../modules/subscription";
import moment from "moment";
import createSubscriptionOrderWorkflow from "../workflows/create-subscription-order";
import { SubscriptionStatus } from "../modules/subscription/types";

export default async function createSubscriptionOrdersJob(
  container: MedusaContainer
) {
  const subscriptionModuleService: SubscriptionModuleService =
    container.resolve(SUBSCRIPTION_MODULE)
  const logger = container.resolve("logger")

  let page = 0
  let limit = 20
  let pagesCount = 0

  do {
    const beginningToday = moment(new Date()).set({
      second: 0,
      minute: 0,
      hour: 0,
    })
    .toDate()
    const endToday = moment(new Date()).set({
      second: 59,
      minute: 59,
      hour: 23,
    })
    .toDate()
  
    const [subscriptions, count] = await subscriptionModuleService
      .listAndCountSubscriptions({
        next_order_date: {
          $gte: beginningToday,
          $lte: endToday
        },
        status: SubscriptionStatus.ACTIVE
      }, {
        skip: page * limit,
        take: limit
      })    

      await Promise.all(
        subscriptions.map(async (subscription) => {
          try {
            const  { result } = await createSubscriptionOrderWorkflow(container)
              .run({
                input: {
                  subscription
                }
              })
  
            logger.info(`Created new order ${result.order.id} for subscription ${subscription.id}`)
          } catch (e) {
            logger.error(`Error creating a new order for subscription ${subscription.id}`, e)
          }
        })
      )

    if (!pagesCount) {
      pagesCount = count / limit
    }
  
    page++
  } while (page < pagesCount - 1)
}

export const config = {
  name: "create-subscriptions",
  schedule: "0 0 * * *", // Every day at midnight
};