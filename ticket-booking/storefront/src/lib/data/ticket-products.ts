"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { TicketProductAvailabilityData, TicketProductSeatsData } from "@lib/util/ticket-product"

export const getTicketProductAvailability = async (
  productId: string
): Promise<TicketProductAvailabilityData> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("ticket-products")),
  }

  return sdk.client
    .fetch<TicketProductAvailabilityData>(
      `/store/ticket-products/${productId}/availability`,
      {
        method: "GET",
        headers,
        next,
        cache: "no-store", // Always fetch fresh data for availability
      }
    )
    .then((data) => data)
}

export const getTicketProductSeats = async (
  productId: string,
  date: string
): Promise<TicketProductSeatsData> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("ticket-products")),
  }

  return sdk.client
    .fetch<TicketProductSeatsData>(
      `/store/ticket-products/${productId}/seats`,
      {
        method: "GET",
        query: {
          date,
        },
        headers,
        next,
        cache: "no-store", // Always fetch fresh data for seats
      }
    )
    .then((data) => data)
}
