"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useCart } from "../../providers/cart"
import { Card } from "../Card"
import { Button, RadioGroup } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "../../lib/sdk"
import { formatPrice } from "../../lib/price"
import { useRouter } from "next/navigation"

type ShippingProps = {
  handle: string
  isActive: boolean
}

export const Shipping = ({
  handle,
  isActive
}: ShippingProps) => {
  const { cart, updateCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [shippingMethod, setShippingMethod] = useState(cart?.shipping_methods?.[0]?.shipping_option_id || "")
  const [shippingOptions, setShippingOptions] = useState<HttpTypes.StoreCartShippingOption[]>([])
  const [calculatedPrices, setCalculatedPrices] = useState<
    Record<string, number>
  >({})
  const router = useRouter()

  useEffect(() => {
    if (shippingOptions.length || !cart) {
      return
    }

    sdk.store.fulfillment.listCartOptions({
      cart_id: cart.id || "",
    })
    .then(({ shipping_options }) => {
      setShippingOptions(shipping_options)
      setLoading(false)
    })
  }, [shippingOptions, cart])

  useEffect(() => {
    if (!cart || !shippingOptions.length) {
      return
    }

    const promises = shippingOptions
        .filter((shippingOption) => shippingOption.price_type === "calculated")
        .map((shippingOption) => 
          sdk.client.fetch(`/store/shipping-options/${shippingOption.id}/calculate`, {
            method: "POST",
            body: {
              cart_id: cart.id,
              data: {
                // pass any data useful for calculation with third-party provider.
              }
            }
          }) as Promise<{ shipping_option: HttpTypes.StoreCartShippingOption }>
        )

    if (promises.length) {
      Promise.allSettled(promises).then((res) => {
        const pricesMap: Record<string, number> = {}
        res
          .filter((r) => r.status === "fulfilled")
          .forEach((p) => (pricesMap[p.value?.shipping_option.id || ""] = p.value?.shipping_option.amount))

        setCalculatedPrices(pricesMap)
      })
    }
  }, [shippingOptions, cart])

  const getShippingOptionPrice = useCallback((shippingOption: HttpTypes.StoreCartShippingOption) => {
    let price = shippingOption.price_type === "flat" ? 
      shippingOption.amount : calculatedPrices[shippingOption.id]

    return formatPrice(price || 0, cart?.currency_code)
  }, [calculatedPrices])

  const isButtonDisabled = useMemo(() => {
    return loading || !shippingMethod
  }, [shippingMethod, loading])

  const handleSubmit = () => {
    if (isButtonDisabled) {
      return
    }

    setLoading(true)

    updateCart({
      shippingMethodData: {
        option_id: shippingMethod,
        data: {
          // TODO add any data necessary for
          // fulfillment provider
        }
      }
    })
    .then(() => {
      setLoading(false)
      router.push(`/${handle}?step=payment`)
    })
  }

  return (
    <Card 
      title="Shipping" 
      isActive={isActive} 
      isDone={!!cart?.shipping_methods?.length}
      path={`/${handle}?step=shipping`}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <RadioGroup
            value={shippingMethod}
            onValueChange={(value) => setShippingMethod(value)}
          >
            {shippingOptions.map((shippingOption) => (
              <div className="flex gap-1" key={shippingOption.id}>
                <RadioGroup.Item value={shippingOption.id} />
                <div className="flex justify-between w-full gap-2">
                  <span className="text-sm">{shippingOption.name}</span>
                  <span className="text-xs text-ui-fg-muted">{getShippingOptionPrice(shippingOption)}</span>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
        <hr className="bg-ui-bg-subtle" />
        <Button
          disabled={isButtonDisabled}
          onClick={handleSubmit}
          className="w-full"
        >
          Go to payment
        </Button>
      </div>
    </Card>
  )
}