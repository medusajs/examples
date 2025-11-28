import React, { useState } from "react"
import {
  Button,
  FocusModal,
  ProgressTabs,
  toast,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { RowType, Venue } from "../types"
import { ProductDetailsStep } from "./product-details-step"
import { CurrencyRegionCombination, PricingStep } from "./pricing-step"

interface CreateTicketProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
}

export const CreateTicketProductModal = ({
  open,
  onOpenChange,
  onSubmit,
}: CreateTicketProductModalProps) => {
  const [currentStep, setCurrentStep] = useState("0")
  const [isLoading, setIsLoading] = useState(false)

  // Step 1 data
  const [name, setName] = useState("")
  const [selectedVenueId, setSelectedVenueId] = useState("")
  const [selectedDates, setSelectedDates] = useState<string[]>([])

  // Step 2 data - prices[rowType][currency_region] = amount
  const [prices, setPrices] = useState<Record<string, Record<string, number>>>({})

  // Fetch venues
  const { data: venuesData } = useQuery<{
    venues: Venue[]
    count: number
  }>({
    queryKey: ["venues"],
    queryFn: () => sdk.client.fetch("/admin/venues")
  })

  // Fetch regions
  const { data: regionsData } = useQuery({
    queryKey: ["regions"],
    queryFn: () => sdk.admin.region.list()
  })

  // Fetch stores
  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: () => sdk.admin.store.list()
  })

  const venues = venuesData?.venues || []
  const regions = regionsData?.regions || []
  const stores = storesData?.stores || []
  const selectedVenue = venues?.find(v => v.id === selectedVenueId)

  // Create currency-region combinations
  const currencyRegionCombinations = React.useMemo(() => {
    const combinations: Array<CurrencyRegionCombination> = []
    
    // Add combinations from regions
    regions.forEach((region: any) => {
      combinations.push({
        currency: region.currency_code,
        region_id: region.id,
        region_name: region.name,
        is_store_currency: false
      })
    })
    
    // Add combinations from stores (all supported currencies)
    stores.forEach((store) => {      
      // Add all supported currencies
      store.supported_currencies.forEach((currency) => {
        combinations.push({
          currency: currency.currency_code,
          region_id: undefined, // No region for store currencies
          is_store_currency: true
        })
      })
    })
    
    return combinations
  }, [regions, stores])

  const resetForm = () => {
    setName("")
    setSelectedVenueId("")
    setSelectedDates([])
    setPrices({})
    setCurrentStep("0")
  }

  const handleCloseModal = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const handleStep1Next = () => {
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!selectedVenueId) {
      toast.error("Please select a venue")
      return
    }
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date")
      return
    }
    setCurrentStep("1")
  }

  const handleStep2Submit = async () => {
    if (!selectedVenue) {
      toast.error("Venue not found")
      return
    }

    // Prepare variants data
    // combine rows with the same row_type
    const combinedRows: Record<RowType, { seat_count: number }> = {
      premium: { seat_count: 0 },
      balcony: { seat_count: 0 },
      standard: { seat_count: 0 },
      vip: { seat_count: 0 }
    }
    selectedVenue.rows.forEach(row => {
      if (!combinedRows[row.row_type]) {
        combinedRows[row.row_type] = { seat_count: 0 }
      }
      combinedRows[row.row_type].seat_count += row.seat_count
    })
    const variants = Object.keys(combinedRows).map(rowType => ({
      row_type: rowType as RowType,
      seat_count: combinedRows[rowType as RowType].seat_count,
      prices: currencyRegionCombinations.map(combo => {
        const key = combo.region_id ? `${combo.currency}_${combo.region_id}` : `${combo.currency}_store`
        const amount = prices[rowType as RowType]?.[key] || 0
        
        const price: any = {
          currency_code: combo.currency,
          amount: amount
        }
        
        // Only add rules for region-based currencies
        if (combo.region_id && !combo.is_store_currency) {
          price.rules = {
            region_id: combo.region_id
          }
        }
        
        return price
      }).filter(price => price.amount > 0) // Only include prices > 0
    })).filter(variant => variant.seat_count > 0)

    setIsLoading(true)
    try {
      await onSubmit({
        name,
        venue_id: selectedVenueId,
        dates: selectedDates,
        variants
      })
      toast.success("Show created successfully")
      handleCloseModal(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to create show")
    } finally {
      setIsLoading(false)
    }
  }

  // Check if step 1 (Product Details) is completed
  const isStep1Completed = name.trim() && selectedVenueId && selectedDates.length > 0

  // Check if step 2 (Pricing) is completed
  const hasAnyPrices = Object.values(prices).some(rowPrices => 
    Object.values(rowPrices).some(amount => amount > 0)
  )
  const isStep2Completed = isStep1Completed && hasAnyPrices

  const steps = [
    {
      label: "Product Details",
      value: "0",
      status: isStep1Completed ? "completed" as const : undefined,
      content: (
        <ProductDetailsStep
          name={name}
          setName={setName}
          selectedVenueId={selectedVenueId}
          setSelectedVenueId={setSelectedVenueId}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          venues={venues}
        />
      )
    },
    {
      label: "Pricing",
      value: "1",
      status: isStep2Completed ? "completed" as const : undefined,
      content: (
        <PricingStep
          selectedVenue={selectedVenue}
          currencyRegionCombinations={currencyRegionCombinations}
          prices={prices}
          setPrices={setPrices}
        />
      )
    }
  ]

  return (
    <FocusModal open={open} onOpenChange={handleCloseModal}>
      <FocusModal.Content>
        <FocusModal.Header className="justify-start py-0">
          <div className="flex flex-col gap-4 w-full">
            <ProgressTabs
              value={currentStep}
              onValueChange={setCurrentStep}
              className="w-full"
            >
              <ProgressTabs.List className="w-full">
                {steps.map((step) => (
                  <ProgressTabs.Trigger 
                    key={step.value} 
                    value={step.value}
                    status={step.status}
                  >
                    {step.label}
                  </ProgressTabs.Trigger>
                ))}
              </ProgressTabs.List>
            </ProgressTabs>
          </div>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-1 flex-col p-6">
          <ProgressTabs
            value={currentStep}
            onValueChange={setCurrentStep}
            className="flex-1 w-full mx-auto"
          >
            {steps.map((step) => (
              <ProgressTabs.Content key={step.value} value={step.value} className="flex-1">
                <div className="max-w-[720px] mx-auto">
                  {step.content}
                </div>
              </ProgressTabs.Content>
            ))}
          </ProgressTabs>
        </FocusModal.Body>
        <FocusModal.Footer>
          <Button
            variant="secondary"
            onClick={() => setCurrentStep(currentStep === "1" ? "0" : "0")}
            disabled={currentStep === "0"}
          >
            Previous
          </Button>
          
          {currentStep === "0" ? (
            <Button
              variant="primary"
              onClick={handleStep1Next}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleStep2Submit}
              isLoading={isLoading}
            >
              Create Show
            </Button>
          )}
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}
