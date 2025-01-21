"use client"

import { Button, Input, RadioGroup } from "@medusajs/ui"
import { useCart } from "../../providers/cart"
import { Card } from "../Card"
import { useEffect, useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "../../lib/sdk"
import { formatPrice } from "../../lib/price"
import { useRouter } from "next/navigation"

type PaymentProps = {
  handle: string
  isActive: boolean
}

export const Payment = ({
  handle,
  isActive
}: PaymentProps) => {
  const { cart, updateItemQuantity, unsetCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [paymentProviders, setPaymentProviders] = useState<HttpTypes.StorePaymentProvider[]>([])
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!loading || !cart) {
      return
    }

    sdk.store.payment.listPaymentProviders({
      region_id: cart.region_id || "",
    })
      .then(({ payment_providers }) => {
        setPaymentProviders(payment_providers)
        setLoading(false)
      })
  }, [loading, cart])

  const handleSelectProvider = async () => {
    if (!selectedPaymentProvider || !cart) {
      return
    }

    setLoading(true)

    sdk.store.payment.initiatePaymentSession(cart, {
      provider_id: selectedPaymentProvider,
    })
      .then(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!selectedPaymentProvider || !cart) {
      return
    }

    handleSelectProvider()
  }, [selectedPaymentProvider])
  const paymentUi = useMemo(() => {
    if (!selectedPaymentProvider) {
      return
    }

    switch (selectedPaymentProvider) {
      // TODO handle other providers
      default:
        return <></>
    }
  }, [selectedPaymentProvider])
  const canPlaceOrder = useMemo(() => {
    switch (selectedPaymentProvider) {
      case "":
        return false
      // TODO handle other providers
      default:
        return true
    }
  }, [selectedPaymentProvider])

  const placeOrder = () => {
    if (!cart || !canPlaceOrder) {
      return
    }
    setLoading(true)

    sdk.store.cart.complete(cart.id)
      .then((data) => {
        if (data.type === "cart") {
          alert(data.error.message)
          setLoading(false)
        } else {
          unsetCart()
          // redirect to confirmation page
          router.push(`/confirmation/${data.order.id}`)
        }
      })
  }

  const getProviderTitle = (providerId: string) => {
    switch(true) {
      case providerId.startsWith("pp_system_default"):
        return "Cash on Delivery"
      default:
        return providerId
    }
  }

  return (
    <Card 
      title="Payment" 
      isActive={isActive} 
      isDone={false}
      path={`/${handle}?step=payment`}
    >
      <span className="text-sm">Your order</span>
      {cart?.items?.map((item) => (
        <div className="flex gap-2" key={item.id}>
          <img src={item.thumbnail} alt={item.title} className="w-24 h-24 rounded" />
          <div className="flex flex-col gap-3">
            <span className="text-base">{item.product_title}</span>
            {item.variant?.options?.map((option) => (
              <span className="flex gap-1 text-sm" key={option.id}>
                <span className="text-ui-fg-muted">{option.option?.title}</span>
                <span className="text-ui-fg-base">{option.value}</span>
              </span>
            ))}
            <span className="flex gap-1 text-sm items-center">
              <span className="text-ui-fg-muted">Quantity</span>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  if (!e.target.value) {
                    return
                  }
                  updateItemQuantity(item.id, parseInt(e.target.value))
                }}
              />
            </span>
          </div>
        </div>
      ))}
      <hr className="bg-ui-bg-subtle" />
      <div className="flex justify-between">
        <span className="text-sm text-ui-fg-muted">Subtotal:</span>
        <span className="text-sm text-ui-fg-base">{formatPrice(
          cart?.item_subtotal || 0,
          cart?.currency_code
        )}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-ui-fg-muted">Shipping & handling:</span>
        <span className="text-sm text-ui-fg-base">{formatPrice(
          cart?.shipping_total || 0,
          cart?.currency_code
        )}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-ui-fg-muted">Total:</span>
        <span className="text-sm text-ui-fg-base">{formatPrice(
          cart?.total || 0,
          cart?.currency_code
        )}</span>
      </div>
      <hr className="bg-ui-bg-subtle" />
      <span className="text-sm">Delivery address</span>
      <p className="text-xs text-ui-fg-muted">
        {cart?.shipping_address?.first_name} {cart?.shipping_address?.last_name}<br />
        {cart?.shipping_address?.address_1}<br />
        {cart?.shipping_address?.city}, {cart?.shipping_address?.postal_code}, {cart?.shipping_address?.country_code}<br />
      </p>
      <hr className="bg-ui-bg-subtle" />
      <span className="text-sm">Payment method</span>
      <div className="flex flex-col gap-2">
        <RadioGroup
          value={selectedPaymentProvider}
          onValueChange={(value) => setSelectedPaymentProvider(value)}
        >
          {paymentProviders.map((paymentProvider) => (
            <div className="flex gap-1" key={paymentProvider.id}>
              <RadioGroup.Item value={paymentProvider.id} />
              <div className="flex justify-between w-full gap-2">
                <span className="text-sm">{getProviderTitle(paymentProvider.id)}</span>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>
      {paymentUi}
      <hr className="bg-ui-bg-subtle" />
      <Button
        className="w-full"
        disabled={!canPlaceOrder || loading}
        onClick={placeOrder}
      >Pay {formatPrice(
        cart?.total || 0,
        cart?.currency_code
      )}</Button>
    </Card>
  )
}