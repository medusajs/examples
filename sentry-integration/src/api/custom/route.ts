import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { testWorkflow } from "../../workflows/test-workflow";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  await testWorkflow.run({})
}
