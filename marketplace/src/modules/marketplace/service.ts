import { MedusaService } from "@medusajs/framework/utils"
import Vendor from "./models/vendor"
import VendorAdmin from "./models/vendor-admin"

class MarketplaceModuleService extends MedusaService({
  Vendor,
  VendorAdmin
}) {
}

export default MarketplaceModuleService