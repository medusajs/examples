import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework";
import SubscriptionModuleService from "../../../../../../modules/subscription/service";
import { 
  SUBSCRIPTION_MODULE
} from "../../../../../../modules/subscription";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const subscriptionModuleService: SubscriptionModuleService =
    req.scope.resolve(SUBSCRIPTION_MODULE)

  const subscription = await subscriptionModuleService
    .cancelSubscriptions(
      req.params.id
    )

  res.json({
    subscription
  })
}