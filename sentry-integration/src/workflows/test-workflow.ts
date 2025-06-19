import { MedusaError } from "@medusajs/utils"
import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"

const throwErrorStep = createStep("throw-error", () => {
  throw new MedusaError(
    "test_error",
    "This is a test error for Sentry integration"
  )
})

export const testWorkflow = createWorkflow("test-workflow", (input) => {
  throwErrorStep()
})
