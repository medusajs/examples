import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { InvoiceStatus } from "../../modules/invoice-generator/models/invoice"
import { INVOICE_MODULE } from "../../modules/invoice-generator"

type StepInput = {
  selector: {
    order_id: string
  }
  data: {
    status: InvoiceStatus
  }
}

export const updateInvoicesStep = createStep(
  "update-invoices",
  async ({ selector, data }: StepInput, { container }) => {
    const invoiceGeneratorService = container.resolve(INVOICE_MODULE)

    const prevData = await invoiceGeneratorService.listInvoices(
      selector
    )

    const updatedInvoices = await invoiceGeneratorService.updateInvoices({
      selector,
      data
    })

    return new StepResponse(updatedInvoices, prevData)
  },
  async (prevData, { container }) => {
    if (!prevData) {
      return
    }

    const invoiceGeneratorService = container.resolve(INVOICE_MODULE)

    await invoiceGeneratorService.updateInvoices(
      prevData.map((i) => ({
        id: i.id,
        status: i.status
      }))
    )
  }
)