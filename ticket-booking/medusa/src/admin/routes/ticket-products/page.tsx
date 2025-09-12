import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ReceiptPercent } from "@medusajs/icons"
import {
  createDataTableColumnHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  DataTablePaginationState,
  Button,
  Badge,
  toast,
} from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import React, { useState, useMemo } from "react"
import { sdk } from "../../lib/sdk"
import { CreateTicketProductModal } from "../../components/create-ticket-product-modal"
import { TicketProduct } from "../../types"

const columnHelper = createDataTableColumnHelper<TicketProduct>()

const columns = [
  columnHelper.accessor("product.title", {
    header: "Name",
  }),
  columnHelper.accessor("venue.name", {
    header: "Venue",
  }),
  columnHelper.accessor("dates", {
    header: "Dates",
    cell: ({ row }) => {
      const dates = row.original.dates || []
      // Show first and last dates
      const displayDates = [dates[0], dates[dates.length - 1]]
      return (
        <div className="flex flex-wrap gap-1 items-center">
          {displayDates.map((date, index) => (
            <React.Fragment key={date}>
              <Badge color="grey" size="small">
                {new Date(date).toLocaleDateString()}
              </Badge>
              {index < displayDates.length - 1 && (
                <span className="text-gray-500 txt-small">
                  -
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      )
    },
  }),
  columnHelper.accessor("product_id", {
    header: "Product",
    cell: ({ row }) => {
      return (
        <Link to={`/products/${row.original.product_id}`}>
          View Product Details
        </Link>
      )
    }
  })
]

const TicketProductsPage = () => {
  const limit = 15
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0
  })
  const [isModalOpen, setIsModalOpen] = useState(false)

  const queryClient = useQueryClient()

  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])

  const { data, isLoading } = useQuery<{
    ticket_products: TicketProduct[]
    count: number
    limit: number
    offset: number
  }>({
    queryKey: ["ticket-products", offset, limit],
    queryFn: () => sdk.client.fetch("/admin/ticket-products", {
      query: {
        offset: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
        order: "-created_at",
      }
    })
  })

  const table = useDataTable({
    columns,
    data: data?.ticket_products || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination
    },
    getRowId: (row) => row.id
  })

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleCreateTicketProduct = async (data: any) => {
    try {
      await sdk.client.fetch("/admin/ticket-products", {
        method: "POST",
        body: data,
      })
      queryClient.invalidateQueries({ queryKey: ["ticket-products"] })
      handleCloseModal()
    } catch (error: any) {
      toast.error(`Failed to create show: ${error.message}`)
    }
  }

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>
            Shows
          </Heading>
          <Button
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
          >
            Create Show
          </Button>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
      <CreateTicketProductModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        onSubmit={handleCreateTicketProduct}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Shows",
  icon: ReceiptPercent
})

export default TicketProductsPage
