import { defineLink } from "@medusajs/framework/utils"
import QuoteModule from "../modules/quote"
import UserModule from "@medusajs/medusa/user"

export default defineLink(
  {
    ...QuoteModule.linkable.message,
    field: "admin_id"
  },
  {
    ...UserModule.linkable.user.id,
    alias: "admin",
  },
  {
    readOnly: true
  }
)