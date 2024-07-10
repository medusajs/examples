import { MedusaService } from "@medusajs/utils"
import Vendor from "./models/vendor"
import VendorAdmin from "./models/vendor-admin"
import { CreateVendorData, VendorData } from "./types"

class MarketplaceModuleService extends MedusaService({
  Vendor,
  VendorAdmin
}) {
  // @ts-expect-error
  async createVendors(
    data: CreateVendorData[]
  ): Promise<VendorData[] | VendorData> {
    const input = (Array.isArray(data) ? data : [data]).map(
      (vendor) => {
        if (!vendor.handle) {
          vendor.handle = vendor.name.toLowerCase().replace(/\s/g, "-")
        }

        return vendor
      }
    )

    return await super.createVendors(input)
  }
}

export default MarketplaceModuleService