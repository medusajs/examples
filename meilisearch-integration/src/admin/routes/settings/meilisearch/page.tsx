import { Container, Heading, Button, toast } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { defineRouteConfig } from "@medusajs/admin-sdk"

const MeilisearchPage = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: () => 
      sdk.client.fetch("/admin/meilisearch/sync", {
        method: "POST"
      }),
    onSuccess: () => {
      toast.success("Successfully triggered data sync to Meilisearch") 
    },
    onError: (err) => {
      console.error(err)
      toast.error("Failed to sync data to Meilisearch") 
    }
  })

  const handleSync = () => {
    mutate()
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Meilisearch Sync</Heading>
      </div>
      <div className="px-6 py-8">
        <Button 
          variant="primary"
          onClick={handleSync}
          isLoading={isPending}
        >
          Sync Data to Meilisearch
        </Button>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Meilisearch",
})

export default MeilisearchPage
