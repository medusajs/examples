import { MedusaService, promiseAll } from "@medusajs/framework/utils"
import Venue from "./models/venue"
import VenueRow from "./models/venue-row"
import TicketProduct from "./models/ticket-product"
import TicketProductVariant from "./models/ticket-product-variant"
import TicketPurchase from "./models/ticket-purchase"
import QRCode from "qrcode"

export class TicketBookingModuleService extends MedusaService({
  Venue,
  VenueRow,
  TicketProduct,
  TicketProductVariant,
  TicketPurchase
}) {
  async generateTicketQRCodes(ticketPurchaseIds: string[]): Promise<Record<string, string>> {
    const ticketPurchases = await this.listTicketPurchases({
      id: ticketPurchaseIds
    })
    const qrCodeData: Record<string, string> = {}

    await promiseAll(
      ticketPurchases.map(async (ticketPurchase) => {
        qrCodeData[ticketPurchase.id] = await QRCode.toDataURL(ticketPurchase.id)
      })
    )

    return qrCodeData
  }
}

export default TicketBookingModuleService
