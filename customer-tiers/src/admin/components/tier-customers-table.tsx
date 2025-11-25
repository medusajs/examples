import { Heading, DataTable, createDataTableColumnHelper, useDataTable, Container, DataTablePaginationState } from "@medusajs/ui"
import { sdk } from "../lib/sdk"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

type TierCustomersTableProps = {
  tierId: string
}

type Customer = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

type CustomersResponse = {
  customers: Customer[]
  count: number
  offset: number
  limit: number
}

const columnHelper = createDataTableColumnHelper<Customer>()

const columns = [
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("first_name", {
    header: "Name",
    cell: ({ row }) => {
      const customer = row.original
      return customer.first_name || customer.last_name
        ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
        : "-"
    },
  }),
]

export const TierCustomersTable = ({ tierId }: TierCustomersTableProps) => {
  const limit = 15
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  })

  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryFn: () =>
      sdk.client.fetch<CustomersResponse>(`/admin/tiers/${tierId}/customers`, {
        method: "GET",
        query: {
          limit,
          offset,
        },
      }),
    queryKey: ["tier", tierId, "customers"],
    enabled: !!tierId,
  })
  const table = useDataTable({
    columns,
    data: customersData?.customers || [],
    getRowId: (customer) => customer.id,
    rowCount: customersData?.count || 0,
    isLoading: customersLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">
            Customers in this Tier
          </Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  )
}

