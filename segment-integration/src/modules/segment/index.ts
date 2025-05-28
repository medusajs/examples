import SegmentAnalyticsProviderService from "./service"
import { 
  ModuleProvider, 
  Modules
} from "@medusajs/framework/utils"

export default ModuleProvider(Modules.ANALYTICS, {
  services: [SegmentAnalyticsProviderService],
})