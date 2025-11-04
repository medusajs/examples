import { MedusaError } from "@medusajs/framework/utils"

export default function validateRentalDates(
  rentalStartDate: string | Date,
  rentalEndDate: string | Date,
  rentalConfiguration: {
    min_rental_days: number
    max_rental_days: number | null
  },
  rentalDays: number | string
) {
  const startDate = rentalStartDate instanceof Date ? rentalStartDate : new Date(rentalStartDate)
  const endDate = rentalEndDate instanceof Date ? rentalEndDate : new Date(rentalEndDate)
  const days = typeof rentalDays === 'number' ? rentalDays : Number(rentalDays)

  // Validate rental period meets configuration requirements
  if (days < rentalConfiguration.min_rental_days) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Rental period of ${days} days is less than the minimum of ${rentalConfiguration.min_rental_days} days`
    )
  }

  if (
    rentalConfiguration.max_rental_days !== null &&
    days > rentalConfiguration.max_rental_days
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Rental period of ${days} days exceeds the maximum of ${rentalConfiguration.max_rental_days} days`
    )
  }

  // validate that the dates aren't in the past
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Reset to start of day
  if (startDate < now || endDate < now) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Rental dates cannot be in the past. Received start date: ${startDate.toISOString()}, end date: ${endDate.toISOString()}`
    )
  }

  if (endDate <= startDate) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `rentalEndDate must be after rentalStartDate`
    )
  }
}