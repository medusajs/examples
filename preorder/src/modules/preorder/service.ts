import { MedusaService } from "@medusajs/framework/utils"
import { PreorderVariant } from "./models/preorder-variant";
import { Preorder } from "./models/preorder";

export default class PreorderModuleService extends MedusaService({
  PreorderVariant,
  Preorder
}) {}