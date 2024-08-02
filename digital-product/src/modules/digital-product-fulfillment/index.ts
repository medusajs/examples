import { ModuleProviderExports } from "@medusajs/types"
import DigitalProductFulfillmentService from "./service"

const services = [DigitalProductFulfillmentService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
