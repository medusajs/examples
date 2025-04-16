import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { toast } from "@medusajs/ui"

const ContentfulSettingsPage = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: () => 
      sdk.client.fetch("/admin/contentful/sync", {
        method: "POST"
      }),
    onSuccess: () => {
      toast.success("Sync to Contentful triggered successfully")
    }
  })

  return (
    <Container className="p-6">
      <div className="flex flex-col gap-y-4">
        <div>
          <Heading level="h1">Contentful Settings</Heading>
        </div>
        <div>
          <Button 
            variant="primary"
            onClick={() => mutate()}
            isLoading={isPending}
          >
            Sync to Contentful
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Contentful",
})

export default ContentfulSettingsPage
