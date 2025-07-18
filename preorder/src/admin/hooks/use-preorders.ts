import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { Preorder, PreordersResponse } from "../lib/types"

export const usePreorders = (orderId: string) => {
  const { data, isLoading, error } = useQuery<PreordersResponse>({
    queryFn: () => sdk.client.fetch(`/admin/orders/${orderId}/preorders`),
    queryKey: ["orders", orderId],
    retry: 2,
    refetchOnWindowFocus: false,
  })

  return {
    preorders: data?.preorders || [],
    isLoading,
    error,
  }
}

export type { Preorder }
