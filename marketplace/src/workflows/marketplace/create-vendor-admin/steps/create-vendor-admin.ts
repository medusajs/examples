import { 
  createStep,
  StepResponse,
} from "@medusajs/workflows-sdk"
import { CreateVendorAdminWorkflowInput } from ".."
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"

const createVendorAdminStep = createStep(
  "create-vendor-admin-step",
  async ({ 
    admin: adminData,
  }: Pick<CreateVendorAdminWorkflowInput, "admin">, 
  { container }) => {
    const marketplaceModuleService: MarketplaceModuleService = 
      container.resolve(MARKETPLACE_MODULE)

    const vendorAdmin = await marketplaceModuleService.createVendorAdmins(
      adminData
    )

    return new StepResponse(vendorAdmin)
  }
)

export default createVendorAdminStep