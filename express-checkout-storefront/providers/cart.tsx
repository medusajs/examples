"use client" // include with Next.js 13+

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState,
} from "react"
import { HttpTypes } from "@medusajs/types"
import { useRegion } from "./region"
import { sdk } from "../lib/sdk"

type CartContextType = {
  cart?: HttpTypes.StoreCart
  addToCart: (variantId: string, quantity: number) => Promise<HttpTypes.StoreCart>
  updateCart: (data: {
    updateData?: HttpTypes.StoreUpdateCart,
    shippingMethodData?: HttpTypes.StoreAddCartShippingMethods
  }) => Promise<HttpTypes.StoreCart | undefined>
  refreshCart: () => Promise<HttpTypes.StoreCart | undefined>
  updateItemQuantity: (itemId: string, quantity: number) => Promise<HttpTypes.StoreCart>
  unsetCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

type CartProviderProps = {
  children: React.ReactNode
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<
    HttpTypes.StoreCart
  >()
  const { region } = useRegion()

  useEffect(() => {
    if (!region) {
      return
    }
    if (cart) {
      localStorage.setItem("cart_id", cart.id)
      return
    }

    const cartId = localStorage.getItem("cart_id")
    if (!cartId) {
      // create a cart
      refreshCart()
    } else {
      // retrieve cart
      sdk.store.cart.retrieve(cartId, {
        fields: "+items.variant.*,+items.variant.options.*,+items.variant.options.option.*"
      })
      .then(({ cart: dataCart }) => {
        setCart(dataCart)
      })
    }
  }, [cart, region])

  useEffect(() => {
    if (!cart || !region || cart.region_id === region.id) {
      return
    }

    sdk.store.cart.update(cart.id, {
      region_id: region.id
    })
    .then(({ cart: dataCart }) => {
      setCart(dataCart)
    })
  }, [region])

  const refreshCart = async () => {
    if (!region) {
      return
    }

    const { cart: dataCart } = await sdk.store.cart.create({
      region_id: region.id,
    })

    localStorage.setItem("cart_id", dataCart.id)
    setCart(dataCart)

    return dataCart
  }

  const addToCart = async (variantId: string, quantity: number) => {
    const newCart = await refreshCart()
    if (!newCart) {
      throw new Error("Could not create cart")
    }
    
    const { cart: dataCart } = await sdk.store.cart.createLineItem(newCart.id, {
      variant_id: variantId,
      quantity,
    })
    setCart(dataCart)

    return dataCart
  }

  const updateCart = async ({
    updateData,
    shippingMethodData
  }: {
    updateData?: HttpTypes.StoreUpdateCart,
    shippingMethodData?: HttpTypes.StoreAddCartShippingMethods
  }) => {
    if (!updateData && !shippingMethodData) {
      return cart
    }
    let returnedCart = cart
    if (updateData) {
      returnedCart = (await sdk.store.cart.update(cart!.id, updateData)).cart
    }
    
    if (shippingMethodData) {
      returnedCart = (await sdk.store.cart.addShippingMethod(cart!.id, shippingMethodData)).cart
    }
    
    setCart(returnedCart)

    return returnedCart
  }

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    const { cart: dataCart } = await sdk.store.cart.updateLineItem(cart!.id, itemId, {
      quantity,
    })
    setCart(dataCart)

    return dataCart
  }

  const unsetCart = () => {
    localStorage.removeItem("cart_id")
    setCart(undefined)
  }

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateCart,
      refreshCart,
      updateItemQuantity,
      unsetCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}