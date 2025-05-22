import { 
  ModuleProvider, 
  Modules,
} from "@medusajs/framework/utils"
import TwilioSMSNotificationService from "./service"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [TwilioSMSNotificationService],
})
