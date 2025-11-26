import { Heading, DataTable, createDataTableColumnHelper, useDataTable, Container } from "@medusajs/ui"
import { Tier } from "../routes/tiers/page"

type TierRulesTableProps = {
  tierRules: Tier["tier_rules"] | undefined
}

type TierRule = {
  id: string
  currency_code: string
  min_purchase_value: number
}

const columnHelper = createDataTableColumnHelper<TierRule>()

const columns = [
  columnHelper.accessor("currency_code", {
    header: "Currency",
    cell: ({ getValue }) => getValue().toUpperCase(),
  }),
  columnHelper.accessor("min_purchase_value", {
    header: "Minimum Purchase Value",
  }),
]

export const TierRulesTable = ({ tierRules }: TierRulesTableProps) => {
  const rules = tierRules || []

  const table = useDataTable({
    columns,
    data: rules,
    getRowId: (rule) => rule.id,
    rowCount: rules.length,
    isLoading: false,
  })

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">
            Tier Rules
          </Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
      </DataTable>
    </Container>
  )
}

