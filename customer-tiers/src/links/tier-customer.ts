import { defineLink } from "@medusajs/framework/utils"
import TierModule from "../modules/tier"
import CustomerModule from "@medusajs/medusa/customer"

export default defineLink(
  {
    linkable: TierModule.linkable.tier,
    filterable: ["id"]
  },
  {
    linkable: CustomerModule.linkable.customer,
    isList: true,
  }
)

