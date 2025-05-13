import { MedusaError } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { account_holder_id } = req.params
  const query = req.scope.resolve("query")
  const paymentModuleService = req.scope.resolve("payment")

  const { data: [accountHolder] } = await query.graph({
    entity: "account_holder",
    fields: [
      "data",
      "provider_id"
    ],
    filters: {
      id: account_holder_id
    }
  })

  if (!accountHolder) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Account holder not found")
  }

  const paymentMethods = await paymentModuleService.listPaymentMethods(
    {
      provider_id: accountHolder.provider_id,
      context: {
        account_holder: {
          data: {
            id: accountHolder.data.id,
          }
        }
      }
    }
  )

  res.json({
    payment_methods: paymentMethods
  })
}
