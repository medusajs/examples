import { MedusaContainer } from "@medusajs/types";
import SubscriptionModuleService from "../modules/subscription/service";
import { SUBSCRIPTION_MODULE } from "../modules/subscription";
import moment from "moment";
import { SubscriptionStatus } from "../modules/subscription/types";

export default async function expireSubscriptionOrdersJob(
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
        expiration_date: {
          $gte: beginningToday,
          $lte: endToday
        },
        status: SubscriptionStatus.ACTIVE
      }, {
        skip: page * limit,
        take: limit
      })    

    const subscriptionIds = subscriptions.map((subscription) => subscription.id)

    await subscriptionModuleService.expireSubscription(subscriptionIds)

    logger.log(`Expired ${subscriptionIds}.`)

    if (!pagesCount) {
      pagesCount = count / limit
    }
  
    page++
  } while (page < pagesCount - 1)
}

export const config = {
  name: "expire-subscriptions",
  schedule: "0 0 * * *", // Every day at midnight
};