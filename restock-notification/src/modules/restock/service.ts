import { MedusaService } from "@medusajs/framework/utils";
import RestockSubscription from "./models/restock-subscription";

class RestockModuleService extends MedusaService({
  RestockSubscription
}) { }

export default RestockModuleService