import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, toast } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"

const PayloadSettingsPage = () => {
  const { 
    mutateAsync: syncProductsToPayload,
    isPending: isSyncingProductsToPayload,
  } = useMutation({
    mutationFn: (collection: string) => 
      sdk.client.fetch(`/admin/payload/sync/${collection}`, {
        method: "POST",
      }),
    onSuccess: () => toast.success(`Triggered syncing collection data with Payload`),
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Payload Settings</Heading>
      </div>
      <div className="flex flex-col gap-4 px-6 py-4">
        <p>
          This page allows you to trigger syncing your Medusa data with Payload. It
          will only create items not in Payload.
        </p>
        <Button
          variant="primary"
          onClick={() => syncProductsToPayload("products")}
          isLoading={isSyncingProductsToPayload}
        >
          Sync Products to Payload
        </Button>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Payload",
})

export default PayloadSettingsPage