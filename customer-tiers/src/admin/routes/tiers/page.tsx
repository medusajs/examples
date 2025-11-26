import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Button,
  DataTable,
  createDataTableColumnHelper,
  useDataTable,
  DataTablePaginationState,
} from "@medusajs/ui"
import { useNavigate, Link } from "react-router-dom"
import { UserGroup } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { sdk } from "../../lib/sdk"
import { CreateTierModal } from "../../components/create-tier-modal"

export type Tier = {
  id: string
  name: string
  promotion: {
    id: string
    code: string
  } | null
  tier_rules: Array<{
    id: string
    min_purchase_value: number
    currency_code: string
  }>
}

type TiersResponse = {
  tiers: Tier[]
  count: number
  offset: number
  limit: number
}

const columnHelper = createDataTableColumnHelper<Tier>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    enableSorting: true,
  }),
  columnHelper.accessor("promotion", {
    header: "Promotion",
    cell: ({ getValue }) => {
      const promotion = getValue()
      return promotion ? <Link to={`/promotions/${promotion.id}`}>{promotion.code}</Link> : "-"
    },
  }),
]

const TiersPage = () => {
  const navigate = useNavigate()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const limit = 15
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  })

  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])

  const { data, isLoading } = useQuery({
    queryFn: () =>
      sdk.client.fetch<TiersResponse>("/admin/tiers", {
        method: "GET",
        query: {
          limit,
          offset,
        },
      }),
    queryKey: ["tiers", "list", limit, offset],
  })

  const tiers = data?.tiers || []

  const table = useDataTable({
    columns,
    data: tiers,
    getRowId: (tier) => tier.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    onRowClick: (_event, row) => {
      navigate(`/tiers/${row.id}`)
    },
  })

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">Customer Tiers</Heading>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Tier
          </Button>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
      <CreateTierModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Customer Tiers",
  icon: UserGroup,
})

export default TiersPage

