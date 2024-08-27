import { 
  createProductsWorkflow,
  createRemoteLinkStep
} from "@medusajs/core-flows";
import { CreateProductDTO } from "@medusajs/types";
import { Modules } from "@medusajs/utils"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/workflows-sdk";
import { RESTAURANT_MODULE } from "../../../modules/restaurant";

type WorkflowInput = {
  products: CreateProductDTO[];
  restaurant_id: string;
};

export const createRestaurantProductsWorkflow = createWorkflow(
  "create-restaurant-products-workflow",
  function (input: WorkflowInput) {
    const products = createProductsWorkflow.runAsStep({
      input: {
        products: input.products,
      },
    });

    const links = transform({
      products,
      input
    }, (data) => data.products.map((product) => ({
      [RESTAURANT_MODULE]: {
        restaurant_id: data.input.restaurant_id
      },
      [Modules.PRODUCT]: {
        product_id: product.id
      }
    })))

    createRemoteLinkStep(links)

    return new WorkflowResponse(products);
  }
);
