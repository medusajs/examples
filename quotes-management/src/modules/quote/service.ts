import { MedusaService } from "@medusajs/framework/utils";
import { Quote } from "./models/quote";

class QuoteModuleService extends MedusaService({ 
  Quote, 
}) {}

export default QuoteModuleService;
