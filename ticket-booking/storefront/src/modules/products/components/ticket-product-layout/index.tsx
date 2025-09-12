"use client"

import React, { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import TicketDateSelection from "./date-quantity-selection"
import SeatSelectionModal from "./seat-selection-modal"

type TicketLayoutProps = {
  product: HttpTypes.StoreProduct
}

const TicketLayout: React.FC<TicketLayoutProps> = ({ product }) => {
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)

  const handleDateQuantitySelect = (date: string, quantity: number) => {
    setSelectedDate(date)
    setSelectedQuantity(quantity)
    setIsSeatModalOpen(true)
  }

  const handleCloseSeatModal = () => {
    setIsSeatModalOpen(false)
    setSelectedDate(null)
    setSelectedQuantity(1)
  }

  return (
    <>
      <TicketDateSelection
        product={product}
        onDateSelect={handleDateQuantitySelect}
        disabled={false}
      />
      
      <SeatSelectionModal
        product={product}
        selectedDate={selectedDate || ""}
        selectedQuantity={selectedQuantity}
        isOpen={isSeatModalOpen}
        onClose={handleCloseSeatModal}
        disabled={false}
      />
    </>
  )
}

export default TicketLayout
