
import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework/http";
import { LOYALTY_MODULE } from "../../../../../modules/loyalty";
import LoyaltyModuleService from "../../../../../modules/loyalty/service";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
    LOYALTY_MODULE
  )

  const points = await loyaltyModuleService.getPoints(
    req.auth_context.actor_id
  )

  res.json({
    points,
  })
}
