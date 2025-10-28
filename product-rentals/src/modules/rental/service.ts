import { MedusaService } from "@medusajs/framework/utils"
import { Rental } from "./models/rental"
import { RentalConfiguration } from "./models/rental-configuration"

class RentalModuleService extends MedusaService({
  Rental,
  RentalConfiguration,
}) {
  async hasRentalOverlap(variant_id: string, start_date: Date, end_date: Date) {
    const [, count] = await this.listAndCountRentals({
      variant_id,
      status: ["active", "pending"],
      $or: [
        { 
          rental_start_date: { 
            $lte: end_date
          },
          rental_end_date: {
            $gte: start_date
          },
        },
      ],
    })

    return count > 0
  }
}

export default RentalModuleService

