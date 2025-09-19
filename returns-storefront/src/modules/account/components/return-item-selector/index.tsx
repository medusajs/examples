"use client"

import { HttpTypes } from "@medusajs/types"
import { Badge, IconButton, Select, Textarea } from "@medusajs/ui"
import { Minus, Plus } from "@medusajs/icons"
import Thumbnail from "@modules/products/components/thumbnail"
import { convertToLocale } from "@lib/util/money"
import { ItemWithDeliveryStatus } from "../../../../lib/util/returns"

export type ReturnItemSelection = {
  id: string
  quantity: number
  return_reason_id?: string
  note?: string
}

type ReturnItemSelectorProps = {
  items: ItemWithDeliveryStatus[]
  returnReasons: HttpTypes.StoreReturnReason[]
  onItemSelectionChange: (item: ReturnItemSelection) => void
  selectedItems: ReturnItemSelection[]
}

const ReturnItemSelector: React.FC<ReturnItemSelectorProps> = ({
  items,
  returnReasons,
  onItemSelectionChange,
  selectedItems,
}) => {
  const handleQuantityChange = ({
    item_id,
    quantity,
    selected_item
  }: {
    item_id: string
    quantity: number
    selected_item?: ReturnItemSelection
  }) => {
    const item = items.find(i => i.id === item_id)
    if (!item || !item.isReturnable) return

    const maxQuantity = item.returnableQuantity
    const newQuantity = Math.max(0, Math.min(quantity, maxQuantity))
    
    onItemSelectionChange({
      id: item_id,
      quantity: newQuantity,
      return_reason_id: selected_item?.return_reason_id || "",
      note: selected_item?.note || "",
    })
  }

  const handleReturnReasonChange = ({
    item_id,
    return_reason_id,
    selected_item
  }: {
    item_id: string
    return_reason_id: string
    selected_item?: ReturnItemSelection
  }) => {
    onItemSelectionChange({
      id: item_id,
      quantity: selected_item?.quantity || 0,
      return_reason_id,
      note: selected_item?.note || "",
    })
  }

  const handleNoteChange = ({
    item_id,
    note,
    selected_item
  }: {
    item_id: string
    note: string
    selected_item?: ReturnItemSelection
  }) => {
    onItemSelectionChange({
      id: item_id,
      quantity: selected_item?.quantity || 0,
      return_reason_id: selected_item?.return_reason_id || "",
      note,
    })
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const itemSelection = selectedItems.find(si => si.id === item.id)
        const currentQuantity = itemSelection?.quantity || 0
        const currentReturnReason = itemSelection?.return_reason_id || ""
        const currentNote = itemSelection?.note || ""

        return (
          <div
            key={item.id}
            className={`p-4 border rounded-lg ${
              !item.isReturnable ? 'opacity-60 bg-gray-50' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex w-16">
                  <Thumbnail thumbnail={item.thumbnail} images={[]} size="square" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="txt-medium truncate">
                    {item.title}
                  </h4>
                  {!item.isReturnable && (
                    // @ts-ignore
                    <Badge color="grey" size="small">
                      {!item.isDelivered ? 'Not delivered' : 'Not returnable'}
                    </Badge>
                  )}
                </div>
                {item.variant && (
                  <p className="txt-small text-ui-fg-subtle">
                    {item.variant.title}
                  </p>
                )}
                <p className="txt-small text-ui-fg-subtle">
                  {item.isReturnable ? (
                    <>Available to return: {item.returnableQuantity} {item.returnableQuantity === 1 ? 'item' : 'items'}</>
                  ) : item.isDelivered ? (
                    <>Delivered: {item.deliveredQuantity} of {item.quantity} {item.quantity === 1 ? 'item' : 'items'} (already processed)</>
                  ) : (
                    <>Delivered: 0 of {item.quantity} {item.quantity === 1 ? 'item' : 'items'}</>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="txt-small">
                  {convertToLocale({
                    amount: item.unit_price,
                    currency_code: "USD", // Default currency, should be passed from parent
                  })}
                </span>
                
                {item.isReturnable ? (
                  <div className="flex items-center gap-2">
                    {/* @ts-ignore */}
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange({
                        item_id: item.id,
                        quantity: currentQuantity - 1,
                        selected_item: itemSelection
                      })}
                      disabled={currentQuantity <= 0}
                    >
                      <Minus />
                    </IconButton>
                    
                    <span className="w-8 text-center txt-small">
                      {currentQuantity}
                    </span>
                    
                    {/* @ts-ignore */}
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange({
                        item_id: item.id,
                        quantity: currentQuantity + 1,
                        selected_item: itemSelection
                      })}
                      disabled={currentQuantity >= item.returnableQuantity}
                    >
                      <Plus />
                    </IconButton>
                  </div>
                ) : (
                  <div className="txt-small text-ui-fg-subtle">
                    Not available
                  </div>
                )}
              </div>
            </div>

            {item.isReturnable && currentQuantity > 0 && (
              <div className="mt-4 pt-4 border-t border-ui-border-base space-y-3">
                <div>
                  <label className="block txt-small-plus mb-2">
                    Return Reason (Optional)
                  </label>
                  <Select
                    value={currentReturnReason}
                    onValueChange={(value) => handleReturnReasonChange({
                      item_id: item.id,
                      return_reason_id: value,
                      selected_item: itemSelection
                    })}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select a reason..." />
                    </Select.Trigger>
                    <Select.Content>
                      {returnReasons.map((reason) => (
                        <Select.Item key={reason.id} value={reason.id}>
                          {reason.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                
                <div>
                  <label className="block txt-small-plus mb-2">
                    Additional Note (Optional)
                  </label>
                  <Textarea
                    value={currentNote}
                    onChange={(e) => handleNoteChange({
                      item_id: item.id,
                      note: e.target.value,
                      selected_item: itemSelection
                    })}
                    placeholder="Please provide any additional information about this return..."
                    rows={2}
                    maxLength={500}
                  />
                  <p className="txt-xsmall text-ui-fg-subtle mt-1">
                    {currentNote.length}/500 characters
                  </p>
                </div>
              </div>
            )}
          </div>
        )
      })}
      
      {selectedItems.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="txt-medium-plus mb-2">Selected Items Summary</h4>
          <div className="space-y-3">
            {selectedItems.map((selectedItem) => {
              const item = items.find(i => i.id === selectedItem.id)
              if (!item) return null
              
              const returnReason = returnReasons.find(r => r.id === selectedItem.return_reason_id)
              
              return (
                <div key={selectedItem.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex justify-between txt-small mb-1">
                    <span>{item.title} x {selectedItem.quantity}</span>
                    <span>
                      {convertToLocale({
                        amount: item.unit_price * selectedItem.quantity,
                        currency_code: "USD", // Default currency, should be passed from parent
                      })}
                    </span>
                  </div>
                  {returnReason && (
                    <p className="txt-xsmall text-ui-fg-subtle">
                      Reason: {returnReason.label}
                    </p>
                  )}
                  {selectedItem.note && (
                    <p className="txt-xsmall text-ui-fg-subtle">
                      Note: {selectedItem.note}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReturnItemSelector
