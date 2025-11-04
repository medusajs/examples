import { defineLink } from "@medusajs/framework/utils"
import RentalModule from "../modules/rental"
import CustomerModule from "@medusajs/medusa/customer"

export default defineLink(
  {
    linkable: CustomerModule.linkable.customer,
    field: "id",
  },
  {
    ...RentalModule.linkable.rental.id,
    primaryKey: "customer_id"
  },
  {
    readOnly: true
  }
)

