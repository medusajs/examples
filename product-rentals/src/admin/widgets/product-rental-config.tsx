import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Drawer,
  Input,
  Label,
  toast,
  Badge,
  usePrompt,
} from "@medusajs/ui"
import { useQuery, useMutation } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useEffect, useState } from "react"

type RentalConfig = {
  id: string
  product_id: string
  min_rental_days: number
  max_rental_days: number | null
  status: "active" | "inactive"
}

type RentalConfigResponse = {
  rental_config: RentalConfig | null
}

const ProductRentalConfigWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [minRentalDays, setMinRentalDays] = useState(1)
  const [maxRentalDays, setMaxRentalDays] = useState<number | null>(null)
  const confirm = usePrompt()

  const { data, isLoading, refetch } = useQuery<RentalConfigResponse>({
    queryFn: () =>
      sdk.client.fetch(`/admin/products/${product.id}/rental-config`),
    queryKey: [["products", product.id, "rental-config"]],
  })

  const upsertMutation = useMutation({
    mutationFn: async (config: {
      min_rental_days?: number
      max_rental_days?: number | null
      status?: "active" | "inactive"
    }) => {
      return sdk.client.fetch(`/admin/products/${product.id}/rental-config`, {
        method: "POST",
        body: config,
      })
    },
    onSuccess: () => {
      toast.success("Rental configuration updated successfully")
      refetch()
      setDrawerOpen(false)
    },
    onError: () => {
      toast.error("Failed to update rental configuration")
    },
  })

  useEffect(() => {
    if (data?.rental_config) {
      setMinRentalDays(data.rental_config.min_rental_days)
      setMaxRentalDays(data.rental_config.max_rental_days)
    }
  }, [data?.rental_config])

  const handleOpenDrawer = () => {
    setDrawerOpen(true)
  }

  const handleSubmit = () => {
    upsertMutation.mutate({
      min_rental_days: minRentalDays,
      max_rental_days: maxRentalDays,
    })
  }

  const handleToggleStatus = async () => {
    if (!data?.rental_config) return
    
    const newStatus = 
      data.rental_config.status === "active" ? 
        "inactive" : "active"
    const action = 
      newStatus === "inactive" ? "Deactivate" : "Activate"
    
    if (await confirm({
      title: `${action} rental configuration?`,
      description: `Are you sure you want to ${action.toLowerCase()} this rental configuration?`,
      variant: newStatus === "inactive" ? "danger" : "confirmation",
    })) {
      upsertMutation.mutate({
        status: newStatus
      })
    }
  }

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Rental Configuration</Heading>
          {!isLoading && data?.rental_config && (
            <Badge color={data.rental_config.status === "active" ? "green" : "grey"} size="2xsmall">
              {data.rental_config.status === "active" ? "Active" : "Inactive"}
            </Badge>
          )}
        </div>

        {isLoading && (
          <div className="px-6 py-4">
            <Text className="text-ui-fg-subtle">Loading...</Text>
          </div>
        )}

        {!isLoading && !data?.rental_config && (
          <>
            <div className="px-6 py-4">
              <Text className="text-ui-fg-subtle">This product is not currently available for rental.</Text>
            </div>
            <div className="flex justify-end border-t px-6 py-4">
              <Button size="small" onClick={handleOpenDrawer} variant="secondary">
                Make Rentable
              </Button>
            </div>
          </>
        )}

        {!isLoading && data?.rental_config && (
          <div className="divide-y">
            <div className="grid grid-cols-2 items-center px-6 py-4">
              <Text size="small" weight="plus" className="mb-1">
                Min Rental Days
              </Text>
              <Text className="text-ui-fg-subtle text-right">{data.rental_config.min_rental_days}</Text>
            </div>
            <div className="grid grid-cols-2 items-center px-6 py-4">
              <Text size="small" weight="plus" className="mb-1">
                Max Rental Days
              </Text>
              <Text className="text-ui-fg-subtle text-right">
                {data.rental_config.max_rental_days ?? "Unlimited"}
              </Text>
            </div>
            <div className="flex gap-2 px-6 py-4 justify-end">
              <Button size="small" variant="secondary" onClick={handleOpenDrawer}>
                Edit
              </Button>
              <Button
                size="small"
                variant={"primary"}
                onClick={handleToggleStatus}
                disabled={upsertMutation.isPending}
                isLoading={upsertMutation.isPending}
              >
                {data.rental_config.status === "active" 
                  ? "Deactivate" 
                  : "Activate"
                }
              </Button>
            </div>
          </div>
        )}
      </Container>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {data?.rental_config ? "Edit" : "Add"} Rental Configuration
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="space-y-4">
            <div>
              <Label htmlFor="min_rental_days">Minimum Rental Days</Label>
              <Input
                id="min_rental_days"
                type="number"
                min="1"
                value={minRentalDays}
                onChange={(e) => setMinRentalDays(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max_rental_days">
                Maximum Rental Days (leave empty for unlimited)
              </Label>
              <Input
                id="max_rental_days"
                type="number"
                min={minRentalDays}
                value={maxRentalDays ?? ""}
                onChange={(e) =>
                  setMaxRentalDays(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              />
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setDrawerOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={upsertMutation.isPending}
                isLoading={upsertMutation.isPending}
              >
                Save
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductRentalConfigWidget

