"use client"

import { TicketProductSeatsData } from "@lib/util/ticket-product"
import { Tooltip, TooltipProvider } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "../../../../lib/util/money"

export type SelectedSeat = {
  seatNumber: string
  rowNumber: string
  rowType: string
  variantId: string
  date: string
  venueRowId: string
}

type SeatSelectionProps = {
  seatData: TicketProductSeatsData
  selectedSeats: SelectedSeat[]
  onSeatSelect: (seat: SelectedSeat) => void
  disabled?: boolean
  product: HttpTypes.StoreProduct
  maxSeats: number
}

export default function SeatSelection({
  seatData,
  selectedSeats,
  onSeatSelect,
  disabled = false,
  product,
  maxSeats,
}: SeatSelectionProps) {
  const getSeatStatus = (rowNumber: string, seatNumber: string) => {
    const seat = seatData.seat_map
      .find(row => row.row_number === rowNumber)
      ?.seats.find(s => s.number === seatNumber)

    if (!seat) return 'unavailable'

    if (seat.is_purchased) return 'purchased'
    
    const isSelected = selectedSeats.some(s => 
      s.seatNumber === seatNumber && s.rowNumber === rowNumber && s.date === seatData.date
    )
    
    if (isSelected) return 'selected'
    
    return 'available'
  }

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'purchased':
        return 'bg-ui-tag-neutral-bg text-ui-tag-neutral-text cursor-not-allowed'
      case 'selected':
        return 'bg-ui-tag-blue-bg text-ui-tag-blue-text'
      case 'available':
        return 'bg-ui-tag-green-bg text-ui-tag-green-text cursor-pointer hover:bg-ui-tag-green-bg-hover'
      default:
        return 'bg-ui-tag-neutral-bg text-ui-tag-neutral-text cursor-not-allowed'
    }
  }

  const formatRowType = (rowType: string) => {
    switch (rowType.toLowerCase()) {
      case 'vip':
        return 'VIP'
      default:
        return rowType.charAt(0).toUpperCase() + rowType.slice(1).toLowerCase()
    }
  }

  const handleSeatClick = (rowNumber: string, seatNumber: string, rowType: string) => {
    if (disabled) return

    const seat = seatData.seat_map
      .find(row => row.row_number === rowNumber)
      ?.seats.find(s => s.number === seatNumber)

    if (!seat || seat.is_purchased || !seat.variant_id) return

    // Check if seat is already selected
    const isAlreadySelected = selectedSeats.some(
      selectedSeat => selectedSeat.seatNumber === seatNumber && selectedSeat.rowNumber === rowNumber
    )

    if (isAlreadySelected) {
      // Unselect the seat
      onSeatSelect({
        seatNumber,
        rowNumber,
        rowType,
        variantId: seat.variant_id,
        date: seatData.date,
        venueRowId: seatData.venue.rows.find(row => row.row_number === rowNumber)?.id as string
      })
      return
    }

    // Check if we've reached the maximum number of seats
    if (selectedSeats.length >= maxSeats) {
      return
    }

    // Select the seat
    onSeatSelect({
      seatNumber,
      rowNumber,
      rowType,
      variantId: seat.variant_id,
      date: seatData.date,
      venueRowId: seatData.venue.rows.find(row => row.row_number === rowNumber)?.id as string
    })
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-y-4">
        {/* Theater Layout */}
        <div className="bg-gradient-to-b from-ui-bg-subtle to-ui-bg-subtle rounded-lg p-4 shadow-elevation-card-rest overflow-y-auto max-h-[500px]">
          {/* Stage Area */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-b from-ui-fg-base to-ui-fg-base text-white px-8 py-4 rounded-lg shadow-xl relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-lg"></div>
              <div className="relative">
                <div className="txt-large-plus mb-1">STAGE</div>
                <div className="txt-small text-ui-alpha-250">Performance Area</div>
              </div>
            </div>
          </div>

          {/* Seating Area */}
          <div>
            <div className="space-y-4">
              {seatData.seat_map.map((row, index) => (
                <div key={row.row_number} className="flex items-baseline justify-center gap-x-3">
                  {/* Row label */}
                  <div className="txt-small text-ui-fg-subtle">
                    {row.row_number}
                  </div>

                  {/* Seats */}
                  <div className="flex gap-x-1 gap-y-1 flex-wrap justify-center">
                    {row.seats.map((seat) => {
                      const status = getSeatStatus(row.row_number, seat.number)
                      const variant = product.variants?.find(v => v.id === seat.variant_id)
                      const seatPrice = variant?.calculated_price?.calculated_amount || 0
                      const currencyCode = variant?.calculated_price?.currency_code || 'USD'
                      
                      const tooltipContent = status === 'purchased' 
                        ? 'Sold' 
                        : status === 'selected'
                        ? 'Selected'
                        : seatPrice > 0
                        ? `Seat ${seat.number} - ${formatRowType(row.row_type)} - ${convertToLocale({
                            amount: seatPrice,
                            currency_code: currencyCode,
                            minimumFractionDigits: 0,
                          })}`
                        : `Seat ${seat.number} - ${formatRowType(row.row_type)}`

                      return (
                        <Tooltip key={seat.number} content={tooltipContent} className="z-[76]">
                          <button
                            onClick={() => handleSeatClick(row.row_number, seat.number, row.row_type)}
                            disabled={disabled || status === 'purchased' || status === 'unavailable' || (status === 'available' && selectedSeats.length >= maxSeats)}
                            className={`
                              w-8 h-8 rounded-sm txt-xsmall transition-all duration-200 flex items-center justify-center
                              ${getSeatColor(status)}
                              ${status === 'purchased' ? 'cursor-not-allowed' : 'cursor-pointer'}
                              ${(status === 'available' && selectedSeats.length >= maxSeats) || status === "purchased" ? 'opacity-50 cursor-not-allowed' : ''}
                              ${status === 'available' ? 'shadow-sm' : ''}
                              ${status === 'selected' ? 'border border-ui-border-interactive' : ''}
                            `}
                          >
                            {seat.number}
                          </button>
                        </Tooltip>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 txt-small">
          <div className="flex items-center gap-x-2">
            <div className="w-5 h-5 bg-ui-tag-green-bg rounded"></div>
            <span className="txt-small-plus">Available</span>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="w-5 h-5 bg-ui-tag-blue-bg rounded"></div>
            <span className="txt-small-plus">Selected</span>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="w-5 h-5 bg-ui-tag-neutral-bg rounded"></div>
            <span className="txt-small-plus">Sold</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
