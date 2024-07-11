import { defineMikroOrmCliConfig } from "@medusajs/utils"
import path from "path"
import Vendor from "./models/vendor"
import VendorAdmin from "./models/vendor-admin"

export default defineMikroOrmCliConfig("marketplace", {
  entities: [Vendor, VendorAdmin] as any[],
  migrations: {
    path: path.join(__dirname, "migrations"),
  },
})