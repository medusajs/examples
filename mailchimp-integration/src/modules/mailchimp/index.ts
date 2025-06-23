import MailchimpNotificationProviderService from "./service"
import { 
  ModuleProvider, 
  Modules
} from "@medusajs/framework/utils"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [MailchimpNotificationProviderService],
})