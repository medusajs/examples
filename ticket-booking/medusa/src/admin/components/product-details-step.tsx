import { useState } from "react"
import {
  Input,
  Label,
  Select,
  DatePicker,
  Button,
  Text,
  Heading,
  Badge,
} from "@medusajs/ui"
import { XMark } from "@medusajs/icons"
import { Venue } from "../types"

interface ProductDetailsStepProps {
  name: string
  setName: (name: string) => void
  selectedVenueId: string
  setSelectedVenueId: (venueId: string) => void
  selectedDates: string[]
  setSelectedDates: (dates: string[]) => void
  venues: Venue[]
}

export const ProductDetailsStep = ({
  name,
  setName,
  selectedVenueId,
  setSelectedVenueId,
  selectedDates,
  setSelectedDates,
  venues
}: ProductDetailsStepProps) => {
  const selectedVenue = venues.find(v => v.id === selectedVenueId)
  
  // Local state for start and end dates
  const [startDate, setStartDate] = useState<Date | undefined>(
    selectedDates.length > 0 ? new Date(selectedDates[0] + 'T00:00:00') : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    selectedDates.length > 1 ? new Date(selectedDates[selectedDates.length - 1] + 'T00:00:00') : undefined
  )

  const generateDateRange = (start: Date, end?: Date) => {
    const dates: string[] = []
    const currentDate = new Date(start)
    
    do {
      // Use local date formatting to avoid timezone issues
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      dates.push(`${year}-${month}-${day}`)
      currentDate.setDate(currentDate.getDate() + 1)
    } while (end && currentDate <= end)
    
    return dates
  }

  const handleStartDateChange = (date: Date | null) => {
    const dateValue = date || undefined
    setStartDate(dateValue)
    setSelectedDates(
      dateValue ? generateDateRange(dateValue, endDate) : []
    )
  }

  const handleEndDateChange = (date: Date | null) => {
    const dateValue = date || undefined
    setEndDate(dateValue)
    if (startDate && dateValue) {
      setSelectedDates(generateDateRange(startDate, dateValue))
    } else if (dateValue) {
      setSelectedDates(generateDateRange(dateValue))
    } else {
      setSelectedDates([])
    }
  }

  const removeDate = (dateToRemove: string) => {
    setSelectedDates(selectedDates.filter(d => d !== dateToRemove))
  }

  return (
    <div className="space-y-6">
      <Heading level="h2">Show Details</Heading>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />
      </div>

      <div>
        <Label htmlFor="venue">Venue</Label>
        <Select
          value={selectedVenueId}
          onValueChange={setSelectedVenueId}
        >
          <Select.Trigger>
            <Select.Value placeholder="Select a venue" />
          </Select.Trigger>
          <Select.Content>
            {venues.map((venue) => (
              <Select.Item key={venue.id} value={venue.id}>
                {venue.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {selectedVenue && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <Text className="txt-small-plus mb-2">Selected Venue: {selectedVenue.name}</Text>
          {selectedVenue.address && (
            <Text className="txt-small text-ui-fg-subtle mb-2">{selectedVenue.address}</Text>
          )}
          <Text className="txt-small text-ui-fg-subtle">
            Rows: {[...new Set(selectedVenue.rows.map(row => row.row_type))].join(", ")}<br/>
            Total Seats: {selectedVenue.rows.reduce((acc, row) => acc + row.seat_count, 0)}
          </Text>
        </div>
      )}

      <hr className="my-6" />

      <div>
        <Heading level="h2">Dates</Heading>
        <div className="mt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <DatePicker
                value={startDate}
                onChange={handleStartDateChange}
                maxValue={endDate}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <DatePicker
                value={endDate}
                onChange={handleEndDateChange}
                minValue={startDate}
              />
            </div>
          </div>
          
          {selectedDates.length > 0 && (
            <div className="space-y-2">
              <Text className="txt-small-plus">
                Selected Dates ({selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''}):
              </Text>
              <div className="flex flex-wrap gap-2">
                {selectedDates.map((date) => (
                  <Badge
                    key={date}
                    color="blue"
                  >
                    <span>{new Date(date).toLocaleDateString()}</span>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => removeDate(date)}
                      className="p-1 hover:bg-transparent"
                    >
                      <XMark />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
