import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ClockSolid } from "@medusajs/icons"
import { Container, Heading, Badge, createDataTableColumnHelper, useDataTable, DataTablePaginationState, DataTable } from "@medusajs/ui"
import { useMemo, useState } from "react"
import { SubscriptionData, SubscriptionStatus } from "../../types"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useNavigate } from "react-router-dom"

const getBadgeColor = (status: SubscriptionStatus) => {
  switch(status) {
    case SubscriptionStatus.CANCELED:
      return "orange"
    case SubscriptionStatus.FAILED:
      return "red"
    case SubscriptionStatus.EXPIRED:
      return "grey"
    default:
      return "green"
  }
}

const getStatusTitle = (status: SubscriptionStatus) => {
  return status.charAt(0).toUpperCase() + 
    status.substring(1)
}

const columnHelper = createDataTableColumnHelper<SubscriptionData>()

const columns = [
  columnHelper.accessor("id", {
    header: "#",
  }),
  columnHelper.accessor("metadata.main_order_id", {
    header: "Main Order",
  }),
  columnHelper.accessor("customer.email", {
    header: "Customer"
  }),
  columnHelper.accessor("subscription_date", {
    header: "Subscription Date",
    cell: ({ getValue }) => {
      return getValue().toLocaleString()
    }
  }),
  columnHelper.accessor("expiration_date", {
    header: "Expiry Date",
    cell: ({ getValue }) => {
      return getValue().toLocaleString()
    }
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      return (
        <Badge color={getBadgeColor(getValue())}>
          {getStatusTitle(getValue())}
        </Badge>
      )
    }
  }),
]

const SubscriptionsPage = () => {
  const navigate = useNavigate()
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: 4,
    pageIndex: 0,
  })

  const query = useMemo(() => {
    return new URLSearchParams({
      limit: `${pagination.pageSize}`,
      offset: `${pagination.pageIndex * pagination.pageSize}`,
    })
  }, [pagination])

  const { data, isLoading } = useQuery<{
    subscriptions: SubscriptionData[],
    count: number
  }>({
    queryFn: () => sdk.client.fetch(`/admin/subscriptions?${query.toString()}`),
    queryKey: ["subscriptions", query.toString()],
  })

  const table = useDataTable({
    columns,
    data: data?.subscriptions || [],
    getRowId: (subscription) => subscription.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    onRowClick(event, row) {
      navigate(`/subscriptions/${row.id}`)
    },
  })


  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar>
          <Heading level="h1">Subscriptions</Heading>
        </DataTable.Toolbar>
				<DataTable.Table />
        {/** This component will render the pagination controls **/}
        <DataTable.Pagination />
      </DataTable>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Subscriptions",
  icon: ClockSolid,
})

export default SubscriptionsPage
