import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { migrateCategoriesFromMagentoId, migrateProductsFromMagentoWorkflowId } from "../../../../workflows"
import { z } from "zod"
import { AdminMagentoMigrationsPost } from "../../../middlewares";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const workflowEngine = req.scope.resolve("workflows")

  const [executions, count] = await workflowEngine.listAndCountWorkflowExecutions(
    {
      workflow_id: [migrateCategoriesFromMagentoId, migrateProductsFromMagentoWorkflowId]
    },
    {
      order: {
        created_at: "DESC"
      }
    }
  )

  res.json({ workflow_executions: executions, count })
}

type AdminMagentoMigrationsPost = z.infer<typeof AdminMagentoMigrationsPost>

export async function POST(
  req: MedusaRequest<AdminMagentoMigrationsPost>,
  res: MedusaResponse
) {
  const type = req.validatedBody.type

  const eventBusService = req.scope.resolve("event_bus")

  eventBusService.emit({
    name: "migrate.magento",
    data: {
      type
    }
  })

  res.json({ success: true })
}
