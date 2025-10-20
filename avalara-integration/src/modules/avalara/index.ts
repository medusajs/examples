import AvalaraTaxModuleProvider from "./service"
import { 
  ModuleProvider, 
  Modules
} from "@medusajs/framework/utils"
import avalaraConnectionLoader from "./loaders/connection"

export default ModuleProvider(Modules.TAX, {
  services: [AvalaraTaxModuleProvider],
  loaders: [avalaraConnectionLoader],
})