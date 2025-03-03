import {
  convertItemResponseToUpdateRequest,
  getSelectsAndRelationsFromObjectArray,
  Modules,
} from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { OrderStatus } from "@medusajs/framework/types"

type StepInput = {
  id: string;
  is_draft_order: boolean;
  status: OrderStatus;
}

export const updateOrderStep = createStep(
  "update-order",
  async (
    data: StepInput,
    { container }
  ) => {
    const { id, ...rest } = data;
    const orderModuleService = container.resolve(Modules.ORDER);

    const { selects, relations } = getSelectsAndRelationsFromObjectArray([
      data,
    ]);

    const dataBeforeUpdate = await orderModuleService.listOrders(
      { id: data.id },
      { relations, select: selects }
    );

    const updatedQuotes = await orderModuleService.updateOrders(id, rest as any);

    return new StepResponse(updatedQuotes, {
      dataBeforeUpdate,
      selects,
      relations,
    });
  },
  async (revertInput, { container }) => {
    if (!revertInput) {
      return;
    }

    const { dataBeforeUpdate, selects, relations } = revertInput;
    const orderModuleService = container.resolve(Modules.ORDER);

    await orderModuleService.updateOrders(
      dataBeforeUpdate.map((data) =>
        convertItemResponseToUpdateRequest(data, selects, relations)
      )
    );
  }
);
