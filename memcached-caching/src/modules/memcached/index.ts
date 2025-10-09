import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import MemcachedCachingProviderService from "./service"
import connection from "./loaders/connection"

export default ModuleProvider(Modules.CACHING, {
  services: [MemcachedCachingProviderService],
  loaders: [connection],
})
