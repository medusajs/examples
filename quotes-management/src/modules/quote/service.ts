import { MedusaService } from "@medusajs/framework/utils";
import { Quote } from "./models/quote";
import { Message } from "./models/message";

class QuoteModuleService extends MedusaService({ 
  Quote, 
  Message
}) {}

export default QuoteModuleService;
