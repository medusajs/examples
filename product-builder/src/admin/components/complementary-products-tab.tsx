import { AdminProduct } from "@medusajs/framework/types"
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
import { ComplementaryProduct } from "../types"

type ComplementaryProductsTabProps = {
  product: AdminProduct
  complementaryProducts: ComplementaryProduct[]
  onComplementaryProductSelection: (productId: string, checked: boolean) => void
}

type ProductRow = {
  id: string
  title: string
  status: string
}

const columnHelper = createDataTableColumnHelper<ProductRow>()

export const ComplementaryProductsTab = ({
  product,
  complementaryProducts,
  onComplementaryProductSelection
}: ComplementaryProductsTabProps) => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  // Fetch products for selection with pagination
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", "complementary", pagination],
    queryFn: async () => {
      const query = new URLSearchParams({
        limit: pagination.pageSize.toString(),
        offset: (pagination.pageIndex * pagination.pageSize).toString(),
        exclude_product_id: product.id
      })
      const response: any = await sdk.client.fetch(
        `/admin/products/complementary?${query.toString()}`
      )
      return {
        products: response.products,
        count: response.count,
      }
    },
  })

  const columns = [
    columnHelper.display({
      id: "select",
      header: "Select",
      cell: ({ row }) => {
        const isChecked = !!complementaryProducts.find(
          (cp) => cp.product_id === row.original.id
        )
        return (
          <Checkbox
            checked={isChecked}
            onCheckedChange={(checked) => 
              onComplementaryProductSelection(row.original.id, !!checked)
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

  const table = useDataTable({
    data: productsData?.products || [],
    columns,
    rowCount: productsData?.count || 0,
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
          <Heading level="h2">Complementary Products</Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </div>
  )
}
