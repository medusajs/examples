"use client"

import { getTicketProductAvailability } from "@lib/data/ticket-products"
import { TicketProductAvailability } from "@lib/util/ticket-product"
import { HttpTypes } from "@medusajs/types"
import { Button, Calendar, Label, IconButton, toast } from "@medusajs/ui"
import { Minus, Plus } from "@medusajs/icons"
import { useState, useEffect } from "react"

type TicketDateSelectionProps = {
  product: HttpTypes.StoreProduct
  onDateSelect: (date: string, nbOfTickets: number) => void
  disabled?: boolean
}

export default function TicketDateSelection({
  product,
  onDateSelect,
  disabled = false,
}: TicketDateSelectionProps) {
  const [nbOfTickets, setNbOfTickets] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availability, setAvailability] = useState<TicketProductAvailability[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load availability data on mount
  useEffect(() => {
    const loadAvailability = async () => {
      setIsLoading(true)
      try {
        const data = await getTicketProductAvailability(product.id)
        setAvailability(data.availability)
      } catch (error) {
        toast.error("Failed to load ticket availability: " + error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAvailability()
  }, [product.id])

  const getTotalAvailableSeats = (dateAvailability: TicketProductAvailability) => {
    return dateAvailability.row_types.reduce(
      (sum, rowType) => sum + rowType.available_seats, 0
    )
  }

  const getFilteredAvailability = (quantity: number) => {
    return availability.filter(avail => getTotalAvailableSeats(avail) >= quantity)
  }

  const filteredAvailability = getFilteredAvailability(nbOfTickets)

  const dateAsStr = (date: Date) => {
    return `${
      date.getFullYear()
    }-${
      String(date.getMonth() + 1).padStart(2, '0')
    }-${String(date.getDate()).padStart(2, '0')}`
  }

  const isDateUnavailable = (date: Date) => {
    const dateString = dateAsStr(date)
    return !filteredAvailability.some(avail => avail.date === dateString)
  }

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
  }

  const handlePickSeats = () => {
    if (!selectedDate) {
      toast.error("Please select a date")
      return
    }
    
    const dateString = dateAsStr(selectedDate)
    onDateSelect(dateString, nbOfTickets)
  }

  return (
    <div className="bg-ui-bg-base">
      <h3 className="txt-large text-center mb-4">Select Show Date</h3>
      {isLoading && (
        <div className="flex flex-col gap-y-4">
          <div className="h-6 bg-ui-bg-subtle rounded animate-pulse w-32 mx-auto" />
          <div className="h-10 bg-ui-bg-subtle rounded animate-pulse w-48 mx-auto" />
          <div className="h-6 bg-ui-bg-subtle rounded animate-pulse w-40 mx-auto" />
        </div>
      )}
      {!isLoading && (
        <div className="flex flex-col gap-y-4">
          {/* Number of tickets selection */}
          <div className="flex justify-center">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="nbOfTickets" className="text-ui-fg-subtle txt-compact-small">Number of Tickets</Label>
              <div className="flex items-center justify-between rounded-md">
                <IconButton
                  onClick={() => setNbOfTickets(Math.max(1, nbOfTickets - 1))}
                  disabled={disabled || nbOfTickets <= 1}
                  variant="transparent"
                >
                  <Minus />
                </IconButton>
                {nbOfTickets}
                <IconButton
                  onClick={() => setNbOfTickets(Math.min(10, nbOfTickets + 1))}
                  disabled={disabled || nbOfTickets >= 10}
                  variant="transparent"
                >
                  <Plus />
                </IconButton>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              onChange={handleDateChange}
              minValue={filteredAvailability.length > 0 ? 
                new Date(filteredAvailability[0].date) : undefined
              }
              maxValue={filteredAvailability.length > 0 ? 
                new Date(filteredAvailability[filteredAvailability.length - 1].date) : undefined
              }
              isDateUnavailable={isDateUnavailable}
            />
          </div>

          {/* Available dates info */}
          {filteredAvailability.length > 0 && (
            <p className="txt-small text-ui-fg-subtle text-center txt-compact-small">
              {filteredAvailability.length} show{filteredAvailability.length !== 1 ? 's' : ''} available for {nbOfTickets} ticket{nbOfTickets !== 1 ? 's' : ''}
            </p>
          )}

          {/* Pick Seats Button */}
          <Button
            onClick={handlePickSeats}
            disabled={disabled || !selectedDate || filteredAvailability.length === 0}
            variant="primary"
            className="w-full"
          >
            Pick Seats
          </Button>
        </div>
      )}
    </div>
  )
}
