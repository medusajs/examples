import { 
  Heading, 
  Checkbox, 
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
} from "@medusajs/ui"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { AddonProduct } from "../types"

type AddonsTabProps = {
  addonProducts: AddonProduct[]
  onAddonProductSelection: (productId: string, checked: boolean) => void
}

type ProductRow = {
  id: string
  title: string
  status: string
}

const columnHelper = createDataTableColumnHelper<ProductRow>()

export const AddonsTab = ({
  addonProducts,
  onAddonProductSelection
}: AddonsTabProps) => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  // Fetch addon products with pagination
  const { data: addonsData, isLoading } = useQuery({
    queryKey: ["products", "addon", pagination],
    queryFn: async () => {
      const response: any = await sdk.client.fetch(
        `/admin/products/addons?limit=${pagination.pageSize}&offset=${pagination.pageIndex * pagination.pageSize}`
      )
      return {
        addons: response.products || [],
        count: response.count || 0,
      }
    },
  })

  const columns = [
    columnHelper.display({
      id: "select",
      header: "Select",
      cell: ({ row }) => {
        const isChecked = !!addonProducts.find(
          (ap) => ap.product_id === row.original.id
        )
        return (
          <Checkbox
            checked={isChecked}
            onCheckedChange={(checked) => 
              onAddonProductSelection(row.original.id, !!checked)
            }
            className="my-2"
          />
        )
      },
    }),
    columnHelper.accessor("title", {
      header: "Product",
    }),
  ]

  const tableData = addonsData?.addons || []

  const table = useDataTable({
    data: tableData,
    columns,
    rowCount: addonsData?.count || 0,
    getRowId: (row) => row.id,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <div>
      <DataTable instance={table}>
        <DataTable.Toolbar>
          <Heading level="h2">Addon Products</Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </div>
  )
}
