import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse,
  MedusaNextFunction
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export default async function validateOktaProvider(
  req: AuthenticatedMedusaRequest, 
  res: MedusaResponse, 
  next: MedusaNextFunction
) {
  if (req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "User already exists"
    )
  }

  const query = req.scope.resolve("query")
  const { data: [authIdentity] } = await query.graph({
    entity: "auth_identity",
    fields: [
      "provider_identities.provider"
    ],
    filters: {
      id: req.auth_context!.auth_identity_id!,
    }
  }, {
    throwIfKeyNotFound: true
  })

  const isOkta = authIdentity.provider_identities.some(identity => identity?.provider === "okta")

  if (!isOkta) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Invalid provider"
    )
  }

  next()
}