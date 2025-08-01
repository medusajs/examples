import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { INVOICE_MODULE } from "../../modules/invoice-generator"
import { InvoiceStatus } from "../../modules/invoice-generator/models/invoice"

type StepInput = {
  order_id: string
}

export const getOrderInvoiceStep = createStep(
  "get-order-invoice",
  async ({ order_id }: StepInput, { container }) => {
    const invoiceGeneratorService = container.resolve(INVOICE_MODULE)
    let [invoice] = await invoiceGeneratorService.listInvoices({
      order_id,
      status: InvoiceStatus.LATEST
    })
    let createdInvoice = false

    if (!invoice) {
      // Store new invoice in database
      invoice = await invoiceGeneratorService.createInvoices({
        order_id,
        status: InvoiceStatus.LATEST,
        pdfContent: {}
      })
      createdInvoice = true
    }

    return new StepResponse(invoice, {
      created_invoice: createdInvoice,
      invoice_id: invoice.id
    })
  },
  async (data, { container }) => {
    const { created_invoice, invoice_id } = data || {}
    if (!created_invoice || !invoice_id) {
      return
    }
    const invoiceGeneratorService = container.resolve(INVOICE_MODULE)

    invoiceGeneratorService.deleteInvoices(invoice_id)
  }
)