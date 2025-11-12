import type { HttpTypes } from "@medusajs/types";

/**
 * Check if a product variant is in stock
 * A variant is in stock if:
 * - manage_inventory is false (inventory tracking disabled), OR
 * - inventory_quantity is greater than 0
 */
export function isVariantInStock(
  variant: HttpTypes.StoreProductVariant | undefined | null
): boolean {
  if (!variant) {
    return false;
  }

  return variant.manage_inventory === false || (variant.inventory_quantity || 0) > 0;
}

