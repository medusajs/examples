import { defineRouteConfig } from "@medusajs/admin-sdk";
import { DocumentText } from "@medusajs/icons";
import { Container, createDataTableColumnHelper, DataTable, DataTablePaginationState, Heading, Toaster, useDataTable } from "@medusajs/ui";
import { Link, useNavigate } from "react-router-dom";
import { useQuotes } from "../../hooks/quotes";
import { AdminQuote } from "../../types";
import { useState } from "react";
import QuoteStatusBadge from "../../components/quote-status-badge";

const columnHelper = createDataTableColumnHelper<AdminQuote>()

const columns = [
  columnHelper.accessor("draft_order.display_id", {
    header: "ID",
    cell: ({ getValue, row }) => <Link to={`/quotes/${row.original.id}`}>#{getValue()}</Link>,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <QuoteStatusBadge status={getValue()} />
  }),
  columnHelper.accessor("customer.email", {
    header: "Email",
  }),
  columnHelper.accessor("draft_order.customer.first_name", {
    header: "First Name",
  }),
  columnHelper.accessor("draft_order.customer.company_name", {
    header: "Company Name",
  }),
  columnHelper.accessor("draft_order.total", {
    header: "Total",
    cell: ({ getValue, row }) => `${row.original.draft_order.currency_code.toUpperCase()} ${getValue()}`
  }),
  columnHelper.accessor("created_at", {
    header: "Created At",
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
]

const Quotes = () => {
  const navigate = useNavigate()
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: 15,
    pageIndex: 0,
  })
  const {
    quotes = [],
    count,
    isPending,
  } = useQuotes({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    fields:
      "+draft_order.total,*draft_order.customer",
    order: "-created_at",
  })

  const table = useDataTable({
    columns,
    data: quotes,
    getRowId: (quote) => quote.id,
    rowCount: count,
    isLoading: isPending,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    onRowClick(event, row) {
      navigate(`/quotes/${row.id}`)
    },
  })


  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <Heading className="p-6 pb-0 font-sans font-medium h1-core">
          Quotes
        </Heading>

        <DataTable instance={table}>
          <DataTable.Toolbar>
            <Heading>Products</Heading>
          </DataTable.Toolbar>
          <DataTable.Table />
          {/** This component will render the pagination controls **/}
          <DataTable.Pagination />
        </DataTable>
      </Container>
      <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "Quotes",
  icon: DocumentText,
});

export default Quotes;
