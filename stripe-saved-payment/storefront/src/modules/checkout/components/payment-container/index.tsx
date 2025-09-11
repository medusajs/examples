import { Radio as RadioGroupOption } from "@headlessui/react"
import { Button, Text, clx } from "@medusajs/ui"
import React, { useContext, useEffect, useMemo, useState, type JSX } from "react"

import Radio from "@modules/common/components/radio"

import { isManual } from "@lib/constants"
import SkeletonCardDetails from "@modules/skeletons/components/skeleton-card-details"
import { CardElement, useElements } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"
import { HttpTypes } from "@medusajs/types"
import { SavedPaymentMethod, getSavedPaymentMethods } from "@lib/data/payment"
import { initiatePaymentSession } from "../../../../lib/data/cart"
import { capitalize } from "lodash"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
  paymentSession?: HttpTypes.StorePaymentSession
  cart: HttpTypes.StoreCart
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
        {
          "border-ui-border-interactive":
            selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4">
          <Radio checked={selectedPaymentOptionId === paymentProviderId} />
          <Text className="text-base-regular">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </Text>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        <span className="justify-self-end text-ui-fg-base">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
  paymentSession,
  cart,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)
  const [isUsingSavedPaymentMethod, setIsUsingSavedPaymentMethod] = useState(
    paymentSession?.data?.payment_method !== null
  )

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out",
      },
    }
  }, [])
  
  const handleRefreshSession = async () => {
    await initiatePaymentSession(cart, {
      provider_id: paymentProviderId,
    })
    setIsUsingSavedPaymentMethod(false)
  }

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
      paymentSession={paymentSession}
      cart={cart}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 transition-all duration-150 ease-in-out">
            <StripeSavedPaymentMethodsContainer
              paymentSession={paymentSession}
              setCardComplete={setCardComplete}
              setCardBrand={setCardBrand}
              setError={setError}
              cart={cart}
            />
            {isUsingSavedPaymentMethod && (
              <Button 
                variant="secondary" 
                size="small" 
                className="mt-2" 
                onClick={handleRefreshSession}
              >
                Use a new payment method
              </Button>
            )}
            {!isUsingSavedPaymentMethod && (
              <>
                <Text className="txt-medium-plus text-ui-fg-base my-1">
                  Enter your card details:
                </Text>
                <CardElement
                  options={useOptions as StripeCardElementOptions}
                  onChange={(e) => {
                    setCardBrand(
                      e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                    )
                    setError(e.error?.message || null)
                    setCardComplete(e.complete)
                    }}
                  />              
              </>
            )}
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
    </PaymentContainer>
  )
}

const StripeSavedPaymentMethodsContainer = ({
  paymentSession,
  setCardComplete,
  setCardBrand,
  setError,
  cart,
}: {
  paymentSession?: HttpTypes.StorePaymentSession
  setCardComplete: (complete: boolean) => void
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  cart: HttpTypes.StoreCart
}) => {
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([])
  console.log(paymentSession)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(
    paymentSession?.data?.payment_method as string | null
  )

  useEffect(() => {
    const accountHolderId = (paymentSession?.context?.account_holder as Record<string, string>)
      ?.id

    if (!accountHolderId) {
      return
    }

    getSavedPaymentMethods(accountHolderId).then(({ payment_methods }) => {
      setSavedPaymentMethods(payment_methods)
    })
  }, [paymentSession])

  useEffect(() => {
    if (!selectedPaymentMethod || !savedPaymentMethods.length) {
      setCardComplete(false)
      setCardBrand("")
      setError(null)
      return
    }
    const selectedMethod = savedPaymentMethods.find(method => method.id === selectedPaymentMethod)

    if (!selectedMethod) {
      return
    }

    setCardBrand(capitalize(selectedMethod.data.card.brand))
    setCardComplete(true)
    setError(null)
  }, [selectedPaymentMethod, savedPaymentMethods])

  const handleSelect = async (method: SavedPaymentMethod) => {
    // initiate a new payment session with the selected payment method
    await initiatePaymentSession(cart, {
      provider_id: method.provider_id,
      data: {
        payment_method: method.id,
      }
    }).catch((error) => {
      setError(error.message)
    })

    setSelectedPaymentMethod(method.id)
  }

  if (!savedPaymentMethods.length) {
    return <></>
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Text className="txt-medium-plus text-ui-fg-base">
        Choose a saved payment method:
      </Text>
      {savedPaymentMethods.map((method) => (
        <div 
          key={method.id}
          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-ui-border-interactive ${
            selectedPaymentMethod === method.id ? "border-ui-border-interactive" : ""
          }`}
          role="button"
          onClick={() => handleSelect(method)}
        >
          <div className="flex items-center gap-x-4">
            <input
              type="radio"
              name="saved-payment-method" 
              value={method.id}
              checked={selectedPaymentMethod === method.id}
              className="h-4 w-4 text-ui-fg-interactive"
              onChange={(e) => {
                if (e.target.checked) {
                  handleSelect(method)
                }
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-ui-fg-base">
                {capitalize(method.data.card.brand)} •••• {method.data.card.last4}
              </span>
              <span className="text-xs text-ui-fg-subtle">
                Expires {method.data.card.exp_month}/{method.data.card.exp_year}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}