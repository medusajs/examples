import { MedusaService } from "@medusajs/framework/utils"
import ProductCategoryImage from "./models/product-category-image"

class ProductMediaModuleService extends MedusaService({
  ProductCategoryImage,
}) {}

export default ProductMediaModuleService

