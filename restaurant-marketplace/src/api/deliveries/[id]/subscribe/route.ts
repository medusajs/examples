import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/medusa";
import {
  Modules,
} from "@medusajs/framework/utils";
import { DELIVERY_MODULE } from "../../../../modules/delivery";
import { handleDeliveryWorkflowId } from "../../../../workflows/delivery/workflows/handle-delivery";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const deliveryModuleService = req.scope.resolve(
    DELIVERY_MODULE
  )

  const { id } = req.params
  
  const delivery = await deliveryModuleService.retrieveDelivery(id)

  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };

  res.writeHead(200, headers);

  const workflowEngine = req.scope.resolve(
    Modules.WORKFLOW_ENGINE
  );

  const workflowSubHandler = (data: any) => {
    res.write("data: " + JSON.stringify(data) + "\n\n");
  };

  await workflowEngine.subscribe({
    workflowId: handleDeliveryWorkflowId,
    transactionId: delivery.transaction_id,
    subscriber: workflowSubHandler,
  });

  res.write(
    "data: " +
      JSON.stringify({
        message: "Subscribed to workflow",
        transactionId: delivery.transaction_id,
      }) +
      "\n\n"
  );
};
