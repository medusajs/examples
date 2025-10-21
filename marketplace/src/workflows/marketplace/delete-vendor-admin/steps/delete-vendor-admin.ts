import { 
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import { DeleteVendorAdminWorkflow } from ".."

const deleteVendorAdminStep = createStep(
  "delete-vendor-admin-step",
  async ({ id }: DeleteVendorAdminWorkflow, { container }) => {
    const marketplaceModuleService: MarketplaceModuleService = 
      container.resolve(MARKETPLACE_MODULE)

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(id)

    await marketplaceModuleService.deleteVendorAdmins(id)

    return new StepResponse(
      undefined,
      vendorAdmin
    )
  },
  async (vendorAdmin, { container }) => {
    if (!vendorAdmin) {
      return
    }
    const marketplaceModuleService: MarketplaceModuleService = 
      container.resolve(MARKETPLACE_MODULE)

    const { vendor: _, ...vendorAdminData } = vendorAdmin

    marketplaceModuleService.createVendorAdmins(vendorAdminData)
  }
)

export default deleteVendorAdminStep