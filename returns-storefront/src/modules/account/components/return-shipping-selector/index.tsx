"use client"

import React, { useEffect, useState } from "react"
import { RadioGroup } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { convertToLocale } from "@lib/util/money"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { Loader } from "@medusajs/icons"
import Radio from "@modules/common/components/radio"

type ReturnShippingSelectorProps = {
  shippingOptions: HttpTypes.StoreCartShippingOption[]
  selectedOption: string
  onOptionSelect: (optionId: string) => void
  cartId: string
  currencyCode: string
}

const ReturnShippingSelector: React.FC<ReturnShippingSelectorProps> = ({
  shippingOptions,
  selectedOption,
  onOptionSelect,
  cartId,
  currencyCode,
}) => {
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})

  useEffect(() => {
    setIsLoadingPrices(true)

    if (shippingOptions?.length) {
      const promises = shippingOptions
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cartId))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      } else {
        setIsLoadingPrices(false)
      }
    } else {
      setIsLoadingPrices(false)
    }
  }, [shippingOptions, cartId])
  
  if (shippingOptions.length === 0) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800 text-sm">
          No return shipping options are currently available. Please contact customer service for assistance.
        </p>
      </div>
    )
  }

  return (
    <RadioGroup
      value={selectedOption}
      onChange={onOptionSelect}
    >
      <div className="space-y-3">
        {shippingOptions.map((option) => (
          <RadioGroup.Option
            key={option.id}
            value={option.id}
            className={clx(
              "p-4 border rounded-lg cursor-pointer transition-colors",
              {
                "border-ui-fg-interactive bg-ui-bg-interactive/5":
                  selectedOption === option.id,
                "border-gray-200 hover:border-gray-300":
                  selectedOption !== option.id,
              }
            )}
          >
            <div className="flex items-center gap-3">
              <Radio
                checked={selectedOption === option.id}
                data-testid={`shipping-option-${option.id}`}
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="txt-medium">
                    {option.name}
                  </h4>
                  <span className="txt-medium">
                    {option.price_type === "flat" ? (
                      convertToLocale({
                        amount: option.amount!,
                        currency_code: currencyCode,
                      })
                    ) : calculatedPricesMap[option.id] ? (
                      convertToLocale({
                        amount: calculatedPricesMap[option.id],
                        currency_code: currencyCode,
                      })
                    ) : isLoadingPrices ? (
                      <Loader />
                    ) : (
                      "-"
                    )}
                  </span>
                </div>
                
                {option.data && typeof option.data === 'object' && option.data !== null && 'description' in option.data && (
                  <p className="txt-small mt-1">
                    {String(option.data.description)}
                  </p>
                )}
              </div>
            </div>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}

export default ReturnShippingSelector
