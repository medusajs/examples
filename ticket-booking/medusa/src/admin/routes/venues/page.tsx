import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings } from "@medusajs/icons"
import { 
  createDataTableColumnHelper, 
  Container, 
  DataTable, 
  useDataTable, 
  Heading, 
  DataTablePaginationState,
  Button,
} from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { sdk } from "../../lib/sdk"
import { Venue, CreateVenueRequest } from "../../types"
import { CreateVenueModal } from "../../components/create-venue-modal"

const columnHelper = createDataTableColumnHelper<Venue>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <div>
        <div className="txt-small-plus">{row.original.name}</div>
        {row.original.address && (
          <div className="txt-small text-gray-500">{row.original.address}</div>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("rows", {
    header: "Total Capacity",
    cell: ({ row }) => {
      const totalCapacity = row.original.rows.reduce(
        (sum, rowItem) => sum + rowItem.seat_count,
        0
      )
      return <span className="txt-small-plus">{totalCapacity} seats</span>
    },
  }),
  columnHelper.accessor("address", {
    header: "Address",
    cell: ({ row }) => (
      <span>{row.original.address || "-"}</span>
    ),
  })
]


const VenuesPage = () => {
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
    venues: Venue[]
    count: number
    limit: number
    offset: number
  }>({
    queryKey: ["venues", offset, limit],
    queryFn: () => sdk.client.fetch("/admin/venues", {
      query: {
        offset: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
        order: "-created_at"
      }
    })
  })

  const table = useDataTable({
    columns,
    data: data?.venues || [],
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

  const handleCreateVenue = async (data: CreateVenueRequest) => {
    try {
      await sdk.client.fetch("/admin/venues", {
        method: "POST",
        body: data,
      })
      queryClient.invalidateQueries({ queryKey: ["venues"] })
      handleCloseModal()
    } catch (error: any) {
      throw new Error(`Failed to create venue: ${error.message}`)
    }
  }

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>
            Venues
          </Heading>
          <Button
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
          >
            Create Venue
          </Button>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
      <CreateVenueModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        onSubmit={handleCreateVenue}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Venues",
  icon: Buildings
})

export default VenuesPage
