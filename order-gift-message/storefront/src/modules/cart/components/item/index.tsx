"use client"

import { Text, clx, Checkbox, Textarea, Button, Label } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [giftUpdating, setGiftUpdating] = useState(false)
  const [newGiftMessage, setNewGiftMessage] = useState(
    item.metadata?.gift_message as string || ""
  )
  const [isEditingGiftMessage, setIsEditingGiftMessage] = useState(false)

  const isGift = item.metadata?.is_gift === "true"
  const giftMessage = item.metadata?.gift_message as string

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const handleGiftToggle = async (checked: boolean) => {
    setGiftUpdating(true)
    
    try {
      const newMetadata = {
        is_gift: checked.toString(),
        gift_message: checked ? newGiftMessage : ""
      }
      
      await updateLineItem({
        lineId: item.id,
        quantity: item.quantity,
        metadata: newMetadata
      })
    } catch (error) {
      console.error("Error updating gift status:", error)
    } finally {
      setGiftUpdating(false)
    }
  }

  const handleSaveGiftMessage = async () => {
    setGiftUpdating(true)
    
    try {
      const newMetadata = {
        is_gift: "true",
        gift_message: newGiftMessage
      }
      
      await updateLineItem({
        lineId: item.id,
        quantity: item.quantity,
        metadata: newMetadata
      })
      setIsEditingGiftMessage(false)
    } catch (error) {
      console.error("Error updating gift message:", error)
    } finally {
      setGiftUpdating(false)
    }
  }

  const handleStartEdit = () => {
    setIsEditingGiftMessage(true)
  }

  const handleCancelEdit = () => {
    setNewGiftMessage(giftMessage || "")
    setIsEditingGiftMessage(false)
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className={clx("flex", {
              "w-16": type === "preview",
              "w-20": type === "full",
            })}
          >
            <Thumbnail
              thumbnail={item.thumbnail}
              images={item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <Text
                className="txt-medium-plus text-ui-fg-base truncate"
                data-testid="product-title"
              >
                {item.product_title}
              </Text>
              <LineItemOptions variant={item.variant} data-testid="product-variant" />
            </div>
          </div>

          {/* Gift Options */}
          <div className="mb-3">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Checkbox
                checked={isGift}
                onCheckedChange={handleGiftToggle}
                disabled={giftUpdating}
                className="w-4 h-4"
                id="is-gift"
              />
              <Label htmlFor="is-gift">
                This is a gift
              </Label>
            </div>
            
            {isGift && (
              <div className="mt-3">
                {isEditingGiftMessage ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Text className="text-sm font-medium text-ui-fg-base">
                        Gift Message:
                      </Text>
                      <Text className="text-xs text-ui-fg-subtle">(optional)</Text>
                    </div>
                    <Textarea
                      placeholder="Add a personal message..."
                      value={newGiftMessage}
                      onChange={(e) => setNewGiftMessage(e.target.value)}
                      disabled={giftUpdating}
                      className="w-full"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={handleCancelEdit}
                        disabled={giftUpdating}
                        className="text-xs px-3 py-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="primary"
                        onClick={handleSaveGiftMessage}
                        disabled={giftUpdating || newGiftMessage === giftMessage}
                        className="text-xs px-3 py-1"
                      >
                        {giftUpdating ? <Spinner /> : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Text className="text-sm font-medium text-ui-fg-base">
                        Gift Message:
                      </Text>
                      {giftMessage ? (
                        <Text className="text-sm text-ui-fg-subtle">
                          {giftMessage}
                        </Text>
                      ) : (
                        <Text className="text-sm text-ui-fg-subtle italic">
                          No message added
                        </Text>
                      )}
                    </div>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={handleStartEdit}
                      className="text-xs px-2 py-1"
                    >
                      {giftMessage ? "Edit" : "Add"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity and Actions */}
          {type === "full" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DeleteButton id={item.id} data-testid="product-delete-button" />
                <CartItemSelect
                  value={item.quantity}
                  onChange={(value) => changeQuantity(parseInt(value.target.value))}
                  className="w-16 h-8 p-2"
                  data-testid="product-select-button"
                >
                  {/* TODO: Update this with the v2 way of managing inventory */}
                  {Array.from(
                    {
                      length: Math.min(maxQuantity, 10),
                    },
                    (_, i) => (
                      <option value={i + 1} key={i}>
                        {i + 1}
                      </option>
                    )
                  )}
                </CartItemSelect>
                {updating && <Spinner />}
              </div>
            </div>
          )}

          {/* Preview Mode */}
          {type === "preview" && (
            <div className="flex items-center justify-between">
              <Text className="text-sm text-ui-fg-subtle">
                Qty: {item.quantity}
              </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </div>
          )}

          <ErrorMessage error={error} data-testid="product-error-message" />
        </div>
      </div>
    </div>
  )
}

export default Item
