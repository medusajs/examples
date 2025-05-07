"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const listCartPaymentMethods = async (regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }

  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      `/store/payment-providers`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ payment_providers }) =>
      payment_providers.sort((a, b) => {
        return a.id > b.id ? 1 : -1
      })
    )
    .catch(() => {
      return null
    })
}

export type SavedPaymentMethod = {
  id: string
  provider_id: string
  data: {
    card: {
      brand: string
      last4: string
      exp_month: number
      exp_year: number
    }
  }
}

export const getSavedPaymentMethods = async (accountHolderId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch<{
    payment_methods: SavedPaymentMethod[]
  }>(
    `/store/payment-methods/${accountHolderId}`,
    {
      method: "GET",
      headers,
    }
  ).catch(() => {
    return {
      payment_methods: [],
    }
  })
}