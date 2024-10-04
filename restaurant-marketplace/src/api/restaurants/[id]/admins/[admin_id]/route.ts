import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework"
import { 
  deleteRestaurantAdminWorkflow
} from "../../../../../workflows/restaurant/workflows/delete-restaurant-admin"

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  await deleteRestaurantAdminWorkflow(req.scope).run({
    input: {
      id: req.params.admin_id
    }
  })

  res.json({ message: "success" })
}