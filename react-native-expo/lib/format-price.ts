/**
 * Format a price amount with currency code
 * Note: Medusa stores prices in major units (e.g., dollars, euros)
 * so no conversion is needed
 */
export function formatPrice(
  amount: number | undefined,
  currencyCode: string | undefined
): string {
  if (amount === undefined || !currencyCode) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount);
}

