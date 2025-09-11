import React from "react"
import { Heading } from "@medusajs/ui"
import { RowType, VenueRow } from "../types"

interface ChartVenueRow extends Pick<VenueRow, "row_number" | "row_type" | "seat_count"> {}

interface SeatChartProps {
  rows: ChartVenueRow[]
  className?: string
}

const getRowTypeColor = (rowType: RowType): string => {
  switch (rowType) {
    case RowType.VIP:
      return "bg-purple-500"
    case RowType.PREMIUM:
      return "bg-orange-500"
    case RowType.BALCONY:
      return "bg-blue-500"
    case RowType.STANDARD:
      return "bg-gray-500"
    default:
      return "bg-gray-300"
  }
}

const getRowTypeLabel = (rowType: RowType): string => {
  switch (rowType) {
    case RowType.VIP:
      return "VIP"
    case RowType.PREMIUM:
      return "Premium"
    case RowType.BALCONY:
      return "Balcony"
    case RowType.STANDARD:
      return "Standard"
    default:
      return "Unknown"
  }
}

export const SeatChart = ({ rows, className = "" }: SeatChartProps) => {
  if (rows.length === 0) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <p>No rows added yet. Add rows to see the seat chart.</p>
      </div>
    )
  }

  // Sort rows by row_number for consistent display
  const sortedRows = [...rows].sort((a, b) => a.row_number.localeCompare(b.row_number))

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Heading level="h3">Seat Chart Preview</Heading>
        <div className="flex items-center gap-4 txt-small">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Premium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Balcony</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>Standard</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="grid grid-cols-[auto_auto_1fr_auto] gap-4 items-center">
          {/* Header row */}
          <div className="txt-small-plus text-gray-700 text-center">Row</div>
          <div className="txt-small-plus text-gray-700 text-center">Type</div>
          <div className="txt-small-plus text-gray-700 text-center">Seats</div>
          <div className="txt-small-plus text-gray-700 text-center">Count</div>
          
          {/* Data rows */}
          {sortedRows.map((row) => (
            <React.Fragment key={row.row_number}>
              <div className="txt-small-plus text-gray-700 text-center">
                {row.row_number}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-4 h-4 rounded ${getRowTypeColor(row.row_type)}`}></div>
                <span className="txt-small text-gray-600">
                  {getRowTypeLabel(row.row_type)}
                </span>
              </div>
              <div className="flex justify-center gap-1 flex-wrap">
                {Array.from({ length: row.seat_count }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${getRowTypeColor(row.row_type)} opacity-70`}
                  />
                ))}
              </div>
              <div className="txt-small text-gray-500 text-center">
                {row.seat_count}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="txt-small text-gray-500">
        Total capacity: {rows.reduce((sum, row) => sum + row.seat_count, 0)} seats
      </div>
    </div>
  )
}
