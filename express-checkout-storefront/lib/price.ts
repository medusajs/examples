export const formatPrice = (amount: number, currency?: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "usd",
  })
  .format(amount)
}