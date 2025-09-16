"use client"

import React, { useState, useActionState } from "react"
import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { createReturnRequest } from "@lib/data/returns"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ReturnItemSelector, { ReturnItemSelection } from "@modules/account/components/return-item-selector"
import ReturnShippingSelector from "@modules/account/components/return-shipping-selector"
import { convertToLocale } from "@lib/util/money"
import { enhanceItemsWithReturnStatus } from "@lib/util/returns"
import { Button } from "@medusajs/ui"

type ReturnRequestTemplateProps = {
  order: HttpTypes.StoreOrder
  shippingOptions: HttpTypes.StoreCartShippingOption[]
  returnReasons: HttpTypes.StoreReturnReason[]
}

const ReturnRequestTemplate: React.FC<ReturnRequestTemplateProps> = ({
  order,
  shippingOptions,
  returnReasons,
}) => {
  const [selectedItems, setSelectedItems] = useState<ReturnItemSelection[]>([])
  const [selectedShippingOption, setSelectedShippingOption] = useState("")
  const [state, formAction] = useActionState(createReturnRequest, {
    success: false,
    error: null,
    return: null,
  })

  // Get all items and categorize them based on delivered quantity and returnable quantity
  const itemsWithDeliveryStatus = enhanceItemsWithReturnStatus(order.items || [])

  const handleItemSelection = ({
    id,
    quantity,
    return_reason_id,
    note,
  }: ReturnItemSelection) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.id === id)
      if (existing) {
        if (quantity === 0) {
          return prev.filter(item => item.id !== id)
        }
        return prev.map(item => {
          return item.id === id ? 
            { ...item, quantity, return_reason_id, note } : 
            item
        })
      } else if (quantity > 0) {
        return [...prev, { id, quantity, return_reason_id, note }]
      }
      return prev
    })
  }

  const handleSubmit = (formData: FormData) => {
    formData.append("order_id", order.id)
    formData.append("items", JSON.stringify(selectedItems))
    formData.append("return_shipping_option_id", selectedShippingOption)
    formAction(formData)
  }

  if (state.success && state.return) {
    return (
      <div className="flex flex-col justify-center gap-y-4">
        <div className="flex gap-2 justify-between items-center">
          <h1 className="text-2xl-semi">Return Request Submitted</h1>
          <LocalizedClientLink
            href="/account/orders"
            className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          >
            <XMark /> Back to orders
          </LocalizedClientLink>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-center">
            <h2 className="text-xl-semi mb-4">Return Request Created Successfully</h2>
            <p className="text-base-regular mb-4">
              Your return request has been submitted. Return ID: <strong>{state.return.id}</strong>
            </p>
            <p className="text-small-regular text-ui-fg-subtle">
              You will receive an email confirmation shortly with return instructions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Request Return</h1>
        <LocalizedClientLink
          href={`/account/orders/details/${order.id}`}
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
        >
          <XMark /> Back to order details
        </LocalizedClientLink>
      </div>

      <div>
        <div className="mb-6">
          <h2 className="text-xl-semi mb-2">Order #{order.display_id}</h2>
          <div className="flex items-center gap-4 text-small-regular text-ui-fg-subtle mb-4">
            <span>Ordered: {new Date(order.created_at).toDateString()}</span>
            <span>Total: {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}</span>
          </div>
          <p className="text-base-regular text-ui-fg-subtle">
            You can request a return for items that have been delivered. Select the items you'd like to return and choose a return shipping option.
          </p>
        </div>

        {itemsWithDeliveryStatus.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-base-regular text-ui-fg-subtle">
              No items available in this order.
            </p>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-6">
            <div>
              <h3 className="txt-medium-plus mb-4">Items to Return</h3>
              <ReturnItemSelector
                items={itemsWithDeliveryStatus}
                returnReasons={returnReasons}
                onItemSelectionChange={handleItemSelection}
                selectedItems={selectedItems}
              />
            </div>

            <div>
              <h3 className="txt-medium-plus mb-4">Choose Return Shipping</h3>
              <ReturnShippingSelector
                shippingOptions={shippingOptions}
                selectedOption={selectedShippingOption}
                onOptionSelect={setSelectedShippingOption}
                cartId={(order as any).cart.id}
                currencyCode={order.currency_code}
              />
            </div>


            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{state.error}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit" 
                variant="primary"
                disabled={selectedItems.length === 0 || selectedShippingOption === ""}
              >
                Request Return
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ReturnRequestTemplate
