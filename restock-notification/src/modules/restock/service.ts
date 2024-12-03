import { MedusaService } from "@medusajs/framework/utils";
import RestockSubscription from "./models/restock-subscription";
import RestockSubscriber from "./models/restock-subscriber";

class RestockModuleService extends MedusaService({
  RestockSubscription,
  RestockSubscriber
}) { }

export default RestockModuleService