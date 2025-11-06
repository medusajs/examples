import { sdk } from "@/lib/sdk";
import { FetchError } from "@medusajs/js-sdk";
import type { HttpTypes } from "@medusajs/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useRegion } from "./region-context";

interface CartContextType {
  cart: HttpTypes.StoreCart | null;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cart_id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedRegion } = useRegion();

  const loadCart = useCallback(async () => {
    if (!selectedRegion) return null;

    try {
      setLoading(true);
      setError(null);

      const savedCartId = await AsyncStorage.getItem(CART_STORAGE_KEY);

      if (savedCartId) {
        try {
          const { cart: fetchedCart } = await sdk.store.cart.retrieve(savedCartId, {
            fields: "+items.*"
          });
          
          setCart(fetchedCart);
          return fetchedCart;
        } catch {
          // Cart not found or invalid, remove from storage
          await AsyncStorage.removeItem(CART_STORAGE_KEY);
        }
      }

      // Create new cart for current region
      const { cart: newCart } = await sdk.store.cart.create({
        region_id: selectedRegion.id,
      }, {
        fields: "+items.*"
      });
      setCart(newCart);
      await AsyncStorage.setItem(CART_STORAGE_KEY, newCart.id);
      return newCart;
    } catch (err) {
      setError(`Failed to load cart: ${err instanceof FetchError ? err.message : String(err)}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  // Load cart on mount
  useEffect(() => {
    loadCart()
  }, [loadCart]);

  // Update cart's region when selected region changes
  useEffect(() => {
    const updateCartRegion = async () => {
      if (!cart || !selectedRegion || cart.region_id === selectedRegion.id) {
        return;
      }

      try {
        setLoading(true);
        const { cart: updatedCart } = await sdk.store.cart.update(cart.id, {
          region_id: selectedRegion.id,
        }, {
          fields: "+items.*"
        });
        setCart(updatedCart);
      } catch (err) {
        setError(`Failed to update cart region: ${err instanceof FetchError ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    updateCartRegion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion]);

  const addToCart = async (variantId: string, quantity: number) => {
    let currentCart = cart;
    
    if (!currentCart) {
      currentCart = await loadCart();
      if (!currentCart) throw new Error("Could not create cart");
    }

    try {
      setLoading(true);
      setError(null);

      const { cart: updatedCart } = await sdk.store.cart.createLineItem(currentCart.id, {
        variant_id: variantId,
        quantity,
      }, {
        fields: "+items.*"
      });
      setCart(updatedCart);
    } catch (err) {
      setError(`Failed to add item to cart: ${err instanceof FetchError ? err.message : String(err)}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;

    try {
      setLoading(true);
      setError(null);

      const { cart: updatedCart } = await sdk.store.cart.updateLineItem(
        cart.id,
        itemId,
        { quantity },
        {
          fields: "+items.*"
        }
      );
      setCart(updatedCart);
    } catch (err) {
      setError(`Failed to update quantity: ${err instanceof FetchError ? err.message : String(err)}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!cart) return;

    try {
      setLoading(true);
      setError(null);

      const { parent: updatedCart } = await sdk.store.cart.deleteLineItem(cart.id, itemId, {
        fields: "+items.*"
      });
      setCart(updatedCart!);
    } catch (err) {
      setError(`Failed to remove item: ${err instanceof FetchError ? err.message : String(err)}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    if (!cart) return;

    try {
      const { cart: updatedCart } = await sdk.store.cart.retrieve(cart.id, {
        fields: "+items.*"
      });
      setCart(updatedCart);
    } catch (err) {
      setError(`Failed to refresh cart: ${err instanceof FetchError ? err.message : String(err)}`);
    }
  };

  const clearCart = async () => {
    setCart(null);
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
    // Create a new cart
    if (selectedRegion) {
      const { cart: newCart } = await sdk.store.cart.create({
        region_id: selectedRegion.id,
      }, {
        fields: "+items.*"
      });
      setCart(newCart);
      await AsyncStorage.setItem(CART_STORAGE_KEY, newCart.id);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateItemQuantity,
        removeItem,
        refreshCart,
        clearCart,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

