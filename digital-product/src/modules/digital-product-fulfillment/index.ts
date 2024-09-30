import { ModuleProviderExports } from "@medusajs/framework/types"
import DigitalProductFulfillmentService from "./service"

const services = [DigitalProductFulfillmentService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
