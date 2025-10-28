import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Drawer,
  Label,
  Select,
  toast,
  Badge,
  Table,
} from "@medusajs/ui"
import { useQuery, useMutation } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { useEffect, useState } from "react"

type Rental = {
  id: string
  variant_id: string
  customer_id: string
  order_id: string
  line_item_id: string
  rental_start_date: string
  rental_end_date: string
  actual_return_date: string | null
  rental_days: number
  status: "pending" | "active" | "returned" | "cancelled"
  product_variant?: {
    id: string
    title: string
    product?: {
      id: string
      title: string
      thumbnail: string
    }
  }
}

type RentalsResponse = {
  rentals: Rental[]
}

const OrderRentalItemsWidget = ({
  data: order,
}: DetailWidgetProps<AdminOrder>) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [newStatus, setNewStatus] = useState("")

  const { data, refetch } = useQuery<RentalsResponse>({
    queryFn: () =>
      sdk.client.fetch(
        `/admin/orders/${order.id}/rentals`
      ),
    queryKey: [["orders", order.id, "rentals"]],
  })

  useEffect(() => {
    if (data?.rentals.length) {
      setSelectedRental(data.rentals[0])
      setNewStatus(data.rentals[0].status)
    }
  }, [data?.rentals])

  const updateMutation = useMutation({
    mutationFn: async (params: { rentalId: string; status: string }) => {
      return sdk.client.fetch(`/admin/rentals/${params.rentalId}`, {
        method: "POST",
        body: { status: params.status },
      })
    },
    onSuccess: () => {
      toast.success("Rental status updated successfully")
      refetch()
      setDrawerOpen(false)
      setSelectedRental(null)
    },
    onError: (error) => {
      toast.error(`Failed to update rental status: ${error.message}`)
    },
  })

  const handleOpenDrawer = (rental: Rental) => {
    setSelectedRental(rental)
    setNewStatus(rental.status)
    setDrawerOpen(true)
  }

  const handleSubmit = () => {
    if (!selectedRental) {
      return
    }

    updateMutation.mutate({
      rentalId: selectedRental.id,
      status: newStatus,
    })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "green"
      case "returned":
        return "blue"
      case "cancelled":
        return "red"
      case "pending":
        return "orange"
      default:
        return "grey"
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!data?.rentals.length) {
    return null
  }

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Rental Items</Heading>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Start Date</Table.HeaderCell>
              <Table.HeaderCell>End Date</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.rentals.map((rental) => (
              <Table.Row key={rental.id}>
                <Table.Cell className="py-4">
                  <div className="flex items-start gap-4">
                    {rental.product_variant?.product?.thumbnail && (
                      <img
                        src={rental.product_variant?.product?.thumbnail || ""}
                        alt={rental.product_variant?.product?.title || ""}
                        className="w-6 h-8 object-cover rounded border border-ui-border-base"
                      />
                    )}
                    <div>
                      <Text weight="plus" size="small" className="text-ui-fg-base">
                        {rental.product_variant?.product?.title || "N/A"}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {rental.product_variant?.title || "N/A"}
                      </Text>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {formatDate(rental.rental_start_date)}
                </Table.Cell>
                <Table.Cell>
                  {formatDate(rental.rental_end_date)}
                </Table.Cell>
                <Table.Cell>
                  <Badge color={getStatusBadgeColor(rental.status)} size="2xsmall">
                    {formatStatus(rental.status)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="small"
                    variant="transparent"
                    onClick={() => handleOpenDrawer(rental)}
                    className="p-0 text-ui-fg-subtle"
                  >
                    Update Status
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Update Rental Status</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="space-y-4">
            {selectedRental && (
              <>
                <div>
                  <Text weight="plus" className="mb-2">
                    Rental Details
                  </Text>
                  <div className="space-y-1">
                    <Text size="small">
                      Product:{" "}
                      {selectedRental.product_variant?.product?.title || "N/A"}
                    </Text>
                    <Text size="small">
                      Variant: {selectedRental.product_variant?.title || "N/A"}
                    </Text>
                    <Text size="small">
                      Rental Period: {formatDate(selectedRental.rental_start_date)} to{" "}
                      {formatDate(selectedRental.rental_end_date)} ({selectedRental.rental_days}{" "}
                      days)
                    </Text>
                  </div>
                </div>
                <hr />
                <div className="space-y-1">
                  <Label htmlFor="status" className="txt-compact-small font-medium">Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <Select.Trigger id="status">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="pending" disabled className="text-ui-fg-disabled">Pending</Select.Item>
                      <Select.Item value="active">Active</Select.Item>
                      <Select.Item value="returned">Returned</Select.Item>
                      <Select.Item value="cancelled">Cancelled</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
              </>
            )}
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
                disabled={updateMutation.isPending || newStatus === selectedRental?.status}
                isLoading={updateMutation.isPending}
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
  zone: "order.details.after",
})

export default OrderRentalItemsWidget

