"use client"

import { addToCart } from "@lib/data/cart"
import { getTicketProductSeats } from "@lib/data/ticket-products"
import { TicketProductSeatsData } from "@lib/util/ticket-product"
import { HttpTypes } from "@medusajs/types"
import { Button, toast } from "@medusajs/ui"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { convertToLocale } from "@lib/util/money"
import SeatSelection, { SelectedSeat } from "./seat-selection"
import Modal from "../../../common/components/modal"

type SeatSelectionModalProps = {
  product: HttpTypes.StoreProduct
  selectedDate: string
  selectedQuantity: number
  isOpen: boolean
  onClose: () => void
  disabled?: boolean
}

export default function SeatSelectionModal({
  product,
  selectedDate,
  selectedQuantity,
  isOpen,
  onClose,
  disabled = false,
}: SeatSelectionModalProps) {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])
  const [seatData, setSeatData] = useState<TicketProductSeatsData | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  const countryCode = useParams().countryCode as string
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seat) => {
      const variant = product.variants?.find(v => v.id === seat.variantId)
      return total + (variant?.calculated_price?.calculated_amount || 0)
    }, 0)
  }, [selectedSeats, product.variants])

  // Load seat data when modal opens
  useEffect(() => {
    if (!isOpen || !selectedDate) {
      return
    }
    setSelectedSeats([])
    setSeatData(null)

    const loadSeatData = async () => {
      try {
        const data = await getTicketProductSeats(product.id, selectedDate)
        setSeatData(data)
      } catch (error) {
        toast.error("Failed to load seat data: " + error)
      }
    }

    loadSeatData()
  }, [isOpen, selectedDate, product.id])

  const handleSeatSelect = (seat: SelectedSeat) => {
    setSelectedSeats(prev => {
      const existingIndex = prev.findIndex(
        s => s.seatNumber === seat.seatNumber && s.rowNumber === seat.rowNumber
      )
      
      if (existingIndex >= 0) {
        // Remove seat if already selected
        return prev.filter((_, index) => index !== existingIndex)
      } else {
        // Add seat if not selected and under limit
        if (prev.length < selectedQuantity) {
          return [...prev, seat]
        }
        return prev
      }
    })
  }

  const handleAddToCart = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat")
      return
    }

    if (selectedSeats.length !== selectedQuantity) {
      toast.error(`Please select exactly ${selectedQuantity} seat${selectedQuantity !== 1 ? 's' : ''}`)
      return
    }

    setIsAddingToCart(true)
    try {
      // Add each seat as a separate cart item
      for (const seat of selectedSeats) {
        await addToCart({
          variantId: seat.variantId,
          quantity: 1,
          countryCode,
          metadata: {
            seat_number: seat.seatNumber,
            row_number: seat.rowNumber,
            show_date: seat.date,
            venue_row_id: seat.venueRowId,
          },
        })
      }

      toast.success(`Added ${selectedSeats.length} ticket${selectedSeats.length !== 1 ? 's' : ''} to cart`)
      
      // Redirect to checkout
      router.push(`/${countryCode}/checkout?step=address`)
    } catch (error) {
      toast.error("Failed to add tickets to cart: " + error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <div className="flex items-center justify-between w-full mb-4">
        <div>
          <h2 className="txt-large-plus">Select Your Seats</h2>
          <p className="txt-small text-ui-fg-subtle">
            {formatDate(selectedDate)} • {seatData?.venue.name} • ({selectedSeats.length}/{selectedQuantity} tickets selected)
          </p>
        </div>
        <Button
          variant="transparent"
          onClick={onClose}
          className="text-ui-fg-muted hover:text-ui-fg-base"
        >
          ✕
        </Button>
      </div>
      
      <div>
        {seatData ? (
          <SeatSelection
            product={product}
            seatData={seatData}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            maxSeats={selectedQuantity}
            disabled={disabled || isAddingToCart}
          />
        ) : (
          <div className="text-center py-8 min-h-[500px]">
            <p className="txt-medium text-ui-fg-subtle">No seat data available</p>
          </div>
        )}
      </div>

      {seatData && (
        <div className="flex items-center justify-between w-full mt-4">
          <div className="flex items-center justify-between w-full">
            <div className="txt-small text-ui-fg-subtle">
              {selectedSeats.length} of {selectedQuantity} seats selected
            </div>
            <div className="flex gap-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isAddingToCart}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddToCart}
                disabled={disabled || isAddingToCart || selectedSeats.length !== selectedQuantity}
                isLoading={isAddingToCart}
              >
                {selectedSeats.length > 0 ? (
                  <>
                    Buy Tickets - {convertToLocale({
                      amount: totalPrice,
                      currency_code: product.variants?.[0]?.calculated_price?.currency_code || 'USD'
                    })}
                  </>
                ) : (
                  'Buy Tickets'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
