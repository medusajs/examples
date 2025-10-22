import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateOrderWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createTransactionStep } from "./steps/create-transaction"
import AvalaraTaxModuleProvider from "../modules/avalara/service"
import { DocumentType } from "avatax/lib/enums/DocumentType"

type WorkflowInput = {
  order_id: string
}

export const createOrderTransactionWorkflow = createWorkflow(
  "create-order-transaction-workflow",
  (input: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "currency_code",
        "items.quantity",
        "items.id",
        "items.unit_price",
        "items.product_id",
        "items.tax_lines.id",
        "items.tax_lines.description",
        "items.tax_lines.code",
        "items.tax_lines.rate",
        "items.tax_lines.provider_id",
        "items.variant.sku",
        "shipping_methods.id",
        "shipping_methods.amount",
        "shipping_methods.tax_lines.id",
        "shipping_methods.tax_lines.description",
        "shipping_methods.tax_lines.code",
        "shipping_methods.tax_lines.rate",
        "shipping_methods.tax_lines.provider_id",
        "shipping_methods.shipping_option_id",
        "customer.id",
        "customer.email",
        "customer.metadata",
        "customer.groups.id",
        "shipping_address.id",
        "shipping_address.address_1",
        "shipping_address.address_2",
        "shipping_address.city",
        "shipping_address.postal_code",
        "shipping_address.country_code",
        "shipping_address.region_code",
        "shipping_address.province",
        "shipping_address.metadata",
      ],
      filters: {
        id: input.order_id
      }
    })

    const transactionInput = transform({ orders }, ({ orders }) => {
      const providerId = `tp_${AvalaraTaxModuleProvider.identifier}_avalara`
      return {
        lines: [
          ...(orders[0]?.items?.map((item) => {
            return {
              number: item?.id ?? "",
              quantity: item?.quantity ?? 0,
              amount: item?.unit_price ?? 0,
              taxCode: item?.tax_lines?.find(
                (taxLine) => taxLine?.provider_id === providerId
              )?.code ?? "",
              itemCode: item?.variant?.sku ?? "",
            }
          }) ?? []),
          ...(orders[0]?.shipping_methods?.map((shippingMethod) => {
            return {
              number: shippingMethod?.id ?? "",
              quantity: 1,
              amount: shippingMethod?.amount ?? 0,
              taxCode: shippingMethod?.tax_lines?.find(
                (taxLine) => taxLine?.provider_id === providerId
              )?.code ?? "",
            }
          }) ?? []),
        ],
        date: new Date(),
        customerCode: orders[0]?.customer?.id ?? "",
        addresses: {
          singleLocation: {
            line1: orders[0]?.shipping_address?.address_1 ?? "",
            line2: orders[0]?.shipping_address?.address_2 ?? "",
            city: orders[0]?.shipping_address?.city ?? "",
            region: orders[0]?.shipping_address?.province ?? "",
            postalCode: orders[0]?.shipping_address?.postal_code ?? "",
            country: orders[0]?.shipping_address?.country_code?.toUpperCase() ?? "",
          }
        },
        currencyCode: orders[0]?.currency_code.toUpperCase() ?? "",
        type: DocumentType.SalesInvoice,
      }
    })

    const response = createTransactionStep(transactionInput)

    const order = updateOrderWorkflow.runAsStep({
      input: {
        id: input.order_id,
        user_id: "",
        metadata: {
          avalara_transaction_code: response.code,
        },
      }
    })
    
    return new WorkflowResponse(order)
  }
)