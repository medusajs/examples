import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@medusajs/ui"
import { sdk } from "../lib/sdk"
import { PreorderVariantResponse, CreatePreorderVariantData } from "../lib/types"
import { HttpTypes } from "@medusajs/framework/types"

export const usePreorderVariant = (variant: HttpTypes.AdminProductVariant) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<PreorderVariantResponse>({
    queryFn: () => sdk.admin.product.retrieveVariant(
      variant.product_id!,
      variant.id,
      { fields: "*preorder_variant" }
    ),
    queryKey: ["preorder-variant", variant.id],
  })

  const upsertMutation = useMutation({
    mutationFn: async (data: CreatePreorderVariantData) => {
      return sdk.client.fetch(`/admin/variants/${variant.id}/preorders`, {
        method: "POST",
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preorder-variant", variant.id] })
      toast.success("Preorder configuration saved successfully")
    },
    onError: (error) => {
      toast.error(`Failed to save preorder configuration: ${error.message}`)
    },
  })

  const disableMutation = useMutation({
    mutationFn: async () => {
      return sdk.client.fetch(`/admin/variants/${variant.id}/preorders`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preorder-variant", variant.id] })
      toast.success("Preorder configuration removed successfully")
    },
    onError: (error) => {
      toast.error(`Failed to remove preorder configuration: ${error.message}`)
    },
  })

  return {
    preorderVariant: data?.variant.preorder_variant?.status === "enabled" ? 
      data.variant.preorder_variant : null,
    isLoading,
    error,
    upsertPreorder: upsertMutation.mutate,
    disablePreorder: disableMutation.mutate,
    isUpserting: upsertMutation.isPending,
    isDisabling: disableMutation.isPending,
  }
}