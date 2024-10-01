import { MedusaService } from "@medusajs/framework/utils"
import DigitalProduct from "./models/digital-product";
import DigitalProductOrder from "./models/digital-product-order";
import DigitalProductMedia from "./models/digital-product-media";

class DigitalProductModuleService extends MedusaService({
  DigitalProduct,
  DigitalProductMedia,
  DigitalProductOrder
}) {

}

export default DigitalProductModuleService