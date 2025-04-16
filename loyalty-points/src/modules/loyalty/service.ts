import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import LoyaltyPoint from "./models/loyalty-point"
import { InferTypeOf } from "@medusajs/framework/types"

type LoyaltyPoint = InferTypeOf<typeof LoyaltyPoint>

class LoyaltyModuleService extends MedusaService({
  LoyaltyPoint,
}) {
  async addPoints(customerId: string, points: number): Promise<LoyaltyPoint> {
    const existingPoints = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    if (existingPoints.length > 0) {
      return await this.updateLoyaltyPoints({
        id: existingPoints[0].id,
        points: existingPoints[0].points + points,
      })
    }

    return await this.createLoyaltyPoints({
      customer_id: customerId,
      points,
    })
  }

  async deductPoints(customerId: string, points: number): Promise<LoyaltyPoint> {
    const existingPoints = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    if (existingPoints.length === 0 || existingPoints[0].points < points) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Insufficient loyalty points"
      )
    }

    return await this.updateLoyaltyPoints({
      id: existingPoints[0].id,
      points: existingPoints[0].points - points,
    })
  }

  async getPoints(customerId: string): Promise<number> {
    const points = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    return points[0]?.points || 0
  }

  async calculatePointsFromAmount(amount: number): Promise<number> {
    // Convert amount to points using a standard conversion rate
    // For example, $1 = 1 point
    // Round down to nearest whole point
    const points = Math.floor(amount)

    if (points < 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Amount cannot be negative"
      )
    }

    return points
  }
}

export default LoyaltyModuleService
