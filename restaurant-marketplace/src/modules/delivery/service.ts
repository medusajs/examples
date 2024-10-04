import { MedusaService } from "@medusajs/framework/utils";
import { Delivery } from "./models/delivery";
import { Driver } from "./models/driver";

class DeliveryModuleService extends MedusaService({
  Delivery,
  Driver,
}) {}

export default DeliveryModuleService;
