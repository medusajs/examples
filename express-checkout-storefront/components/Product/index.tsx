"use client"

import { HttpTypes } from "@medusajs/types"
import { Button, Input, Select } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"
import { useRegion } from "../../providers/region"
import { Spinner } from "@medusajs/icons"
import { useCart } from "../../providers/cart"
import { useRouter } from "next/navigation"
import { Card } from "../Card"
import { formatPrice } from "../../lib/price"

type ProductProps = {
  handle: string
  isActive: boolean
}

export const Product = ({ handle, isActive }: ProductProps) => {
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<HttpTypes.StoreProduct>()
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({})
  const [quantity, setQuantity] = useState(1)
  const { region } = useRegion()
  const { cart, addToCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (product || !region) {
      return
    }
    
    sdk.store.product.list({
      handle,
      region_id: region.id,
      fields: `*variants.calculated_price,+variants.inventory_quantity`,
    })
    .then(({ products }) => {
      if (products.length) {
        setProduct(products[0])
      }
      setLoading(false)
    })
  }, [product, region])

  const selectedVariant = useMemo(() => {
    if (
      !product?.variants ||
      !product.options || 
      Object.keys(selectedOptions).length !== product.options?.length
    ) {
      return
    }

    return product.variants.find((variant) => variant.options?.every(
      (optionValue) => optionValue.id === selectedOptions[optionValue.option_id!]
    ))
  }, [selectedOptions, product])

  const price = useMemo(() => {
    const selectedVariantPrice = selectedVariant || 
      product?.variants?.sort((a: HttpTypes.StoreProductVariant, b: HttpTypes.StoreProductVariant) => {
        if (!a.calculated_price?.calculated_amount && !b.calculated_price?.calculated_amount) {
          return 0
        }
        if (!a.calculated_price?.calculated_amount) {
          return 1
        }
        if (!b.calculated_price?.calculated_amount) {
          return -1
        }
        return (
          a.calculated_price?.calculated_amount -
          b.calculated_price?.calculated_amount
        )
      })[0]

    return formatPrice(
      selectedVariantPrice?.calculated_price?.calculated_amount || 0,
      region?.currency_code
    )
  }, [selectedVariant, product, region])

  const isInStock = useMemo(() => {
    if (!selectedVariant) {
      return undefined
    }

    return selectedVariant.manage_inventory === false || (selectedVariant.inventory_quantity || 0) > 0
  }, [selectedVariant])

  const handleAddToCart = () => {
    if (!selectedVariant || !isInStock || !quantity) {
      return
    }
    setLoading(true)

    addToCart(selectedVariant.id!, quantity)
    .then(() => {
      router.push(`/${handle}?step=address`)
    })
  }

  return (
    <Card 
      title="Product" 
      isActive={isActive} 
      isDone={cart?.items !== undefined && cart?.items?.length > 0}
      path={`/${handle}`}
    >
      {loading && <Spinner />}
      {!loading && !product && <div>Product not found</div>}
      {!loading && product && (
        <div className="flex gap-4 flex-col">
          <div className="flex gap-4">
            <img 
              src={product.thumbnail || ""}
              className="rounded"
              width={160}
              height={200}
            />
            <div className="flex flex-col gap-1">
              {product.categories?.length && (
                <span className="text-xs text-ui-fg-muted">
                  {product.categories[0].name}
                </span>
              )}
              <span className="text-base text-ui-fg-base">
                {product.title}
              </span>
              <span className="text-sm text-ui-fg-subtle">
                {price}
              </span>
            </div>
          </div>
          <p className="text-sm text-ui-fg-subtle">
            {product.description}
          </p>
          {product.options?.map((option) => (
            <div className="flex flex-col gap-1" key={option.id}>
              <span className="text-xs text-ui-fg-muted">
                {option.title}
              </span>
              <Select 
                onValueChange={(value) => {
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [option.id!]: value,
                  }))
                }}
                value={selectedOptions[option.id!]}
              >
                <Select.Trigger>
                  <Select.Value placeholder={`Select ${option.title}`} />
                </Select.Trigger>
                <Select.Content>
                  {option.values?.map((value) => (
                    <Select.Item
                      key={value.id}
                      value={value.id}
                    >
                      {value.value}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ui-fg-muted">
              Quantity
            </span>
            <Input
              name="quantity"
              placeholder="Quantity"
              type="number"
              min="1"
              max={selectedVariant?.inventory_quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>
          <hr className="bg-ui-bg-subtle" />
          <Button
            disabled={!selectedVariant || !isInStock || loading}
            onClick={handleAddToCart}
            className="w-full"
          >
            {!selectedVariant && "Select Options"}
            {selectedVariant && !isInStock && "Out of Stock"}
            {selectedVariant && isInStock && "Add to Cart"}
          </Button>
        </div>
      )}
    </Card>
  )
}