import { HttpTypes } from "@medusajs/framework/types";
import { FetchError } from "@medusajs/js-sdk";
import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { sdk } from "../lib/sdk";

export const orderPreviewQueryKey = "custom_orders";

export const useOrderPreview = (
  id: string,
  query?: HttpTypes.AdminOrderFilters,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminOrderPreviewResponse,
      FetchError,
      HttpTypes.AdminOrderPreviewResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.order.retrievePreview(id, query),
    queryKey: [orderPreviewQueryKey, id],
    ...options,
  });

  return { ...data, ...rest };
};
