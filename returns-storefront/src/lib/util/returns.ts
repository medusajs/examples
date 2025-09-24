import { HttpTypes } from "@medusajs/types"

export type ItemWithDeliveryStatus = HttpTypes.StoreOrderLineItem & {
  deliveredQuantity: number
  returnableQuantity: number
  isDelivered: boolean
  isReturnable: boolean
}

export const calculateReturnableQuantity = (item: HttpTypes.StoreOrderLineItem): number => {
  const deliveredQuantity = item.detail?.delivered_quantity || 0
  const returnRequestedQuantity = item.detail?.return_requested_quantity || 0
  const returnReceivedQuantity = item.detail?.return_received_quantity || 0
  const writtenOffQuantity = item.detail?.written_off_quantity || 0

  return Math.max(0, deliveredQuantity - returnRequestedQuantity - returnReceivedQuantity - writtenOffQuantity)
}

export const isItemReturnable = (item: HttpTypes.StoreOrderLineItem): boolean => {
  return calculateReturnableQuantity(item) > 0
}

export const hasReturnableItems = (order: HttpTypes.StoreOrder): boolean => {
  return order.items?.some(isItemReturnable) || false
}

export const enhanceItemsWithReturnStatus = (items: HttpTypes.StoreOrderLineItem[]): ItemWithDeliveryStatus[] => {
  return items.map(item => {
    const deliveredQuantity = item.detail?.delivered_quantity || 0
    const returnableQuantity = calculateReturnableQuantity(item)

    return {
      ...item,
      deliveredQuantity,
      returnableQuantity,
      isDelivered: deliveredQuantity > 0,
      isReturnable: returnableQuantity > 0
    }
  })
}