import { MedusaService } from "@medusajs/framework/utils"
import ProductBuilder from "./models/product-builder"
import ProductBuilderCustomField from "./models/product-builder-custom-field"
import ProductBuilderComplementary from "./models/product-builder-complementary"
import ProductBuilderAddon from "./models/product-builder-addon"

class ProductBuilderModuleService extends MedusaService({
  ProductBuilder,
  ProductBuilderCustomField,
  ProductBuilderComplementary,
  ProductBuilderAddon,
}) {}

export default ProductBuilderModuleService
