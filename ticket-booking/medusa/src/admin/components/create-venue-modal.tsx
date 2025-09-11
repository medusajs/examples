import { useState } from "react"
import {
  FocusModal,
  Heading,
  Input,
  Select,
  Textarea,
  Label,
  Button,
  toast,
} from "@medusajs/ui"
import { CreateVenueRequest, RowType, VenueRow } from "../types"
import { SeatChart } from "./seat-chart"

interface NewVenueRow extends Pick<VenueRow, "row_number" | "row_type" | "seat_count"> {}

interface CreateVenueModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateVenueRequest) => Promise<void>
}

export const CreateVenueModal = ({
  open,
  onOpenChange,
  onSubmit,
}: CreateVenueModalProps) => {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [rows, setRows] = useState<NewVenueRow[]>([])
  const [newRow, setNewRow] = useState({
    row_number: "",
    row_type: RowType.VIP,
    seat_count: 10
  })
  const [isLoading, setIsLoading] = useState(false)

  const addRow = () => {
    if (!newRow.row_number.trim()) {
      toast.error("Row number is required")
      return
    }

    if (rows.some(row => row.row_number === newRow.row_number)) {
      toast.error("Row number already exists")
      return
    }

    if (newRow.seat_count <= 0) {
      toast.error("Seat count must be greater than 0")
      return
    }

    setRows([...rows, {
      row_number: newRow.row_number,
      row_type: newRow.row_type,
      seat_count: newRow.seat_count,
    }])
    setNewRow({
      row_number: "",
      row_type: RowType.VIP,
      seat_count: 10
    })
  }

  const removeRow = (rowNumber: string) => {
    setRows(rows.filter(row => row.row_number !== rowNumber))
  }

  const formatRowType = (rowType: RowType) => {
    switch (rowType) {
      case RowType.VIP:
        return "VIP"
      default:
        return rowType.charAt(0).toUpperCase() + rowType.slice(1).toLowerCase()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Venue name is required")
      return
    }

    if (rows.length === 0) {
      toast.error("At least one row is required")
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim() || undefined,
        rows: rows.map(row => ({
          row_number: row.row_number,
          row_type: row.row_type,
          seat_count: row.seat_count
        }))
      })
      handleClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setAddress("")
    setRows([])
    setNewRow({
      row_number: "",
      row_type: RowType.VIP,
      seat_count: 10
    })
    onOpenChange(false)
  }

  return (
    <FocusModal open={open} onOpenChange={handleClose}>
      <FocusModal.Content>
        <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
          <FocusModal.Header>
            <Heading level="h1">Create New Venue</Heading>
          </FocusModal.Header>
          <FocusModal.Body className="p-6 overflow-auto">
            <div className="max-w-[720px] mx-auto">
              <div className="space-y-4 w-fit mx-auto">
                <div>
                  <Label htmlFor="name">Venue Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter venue name"
                  />
                </div>

                <div>
                  <Label htmlFor="address">
                    Address
                    <span className="text-ui-fg-muted txt-compact-small"> (Optional)</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter venue address"
                    rows={3}
                  />
                </div>

                <div className="border-t pt-4">
                  <Heading level="h3" className="mb-2">Add Rows</Heading>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="row_number">Row Number</Label>
                        <Input
                          id="row_number"
                          value={newRow.row_number}
                          onChange={(e) => setNewRow({ ...newRow, row_number: e.target.value })}
                          placeholder="A, B, 1, 2..."
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="row_type">Row Type</Label>
                        <Select
                          value={newRow.row_type}
                          onValueChange={(value) => setNewRow({ ...newRow, row_type: value as RowType })}
                        >
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value={RowType.VIP}>VIP</Select.Item>
                            <Select.Item value={RowType.PREMIUM}>Premium</Select.Item>
                            <Select.Item value={RowType.BALCONY}>Balcony</Select.Item>
                            <Select.Item value={RowType.STANDARD}>Standard</Select.Item>
                          </Select.Content>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="seat_count">Seat Count</Label>
                        <Input
                          id="seat_count"
                          type="number"
                          min="1"
                          value={newRow.seat_count}
                          onChange={(e) => setNewRow({ ...newRow, seat_count: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addRow}
                      disabled={!newRow.row_number.trim()}
                    >
                      Add Row
                    </Button>
                  </div>

                  {rows.length > 0 && (
                    <div className="mt-4">
                      <h4 className="txt-small-plus mb-2">Added Rows</h4>
                      <div className="space-y-2">
                        {rows.map((row) => (
                          <div key={row.row_number} className="flex items-center justify-between p-2 bg-ui-bg-subtle rounded">
                            <span className="txt-small">
                              Row {row.row_number} - {formatRowType(row.row_type)} ({row.seat_count} seats)
                            </span>
                            <Button
                              type="button"
                              variant="danger"
                              size="small"
                              onClick={() => removeRow(row.row_number)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <hr className="my-10" />

              <div>
                <SeatChart rows={rows} />
              </div>
            </div>
          </FocusModal.Body>
          <FocusModal.Footer>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!name.trim() || rows.length === 0}
            >
              Create Venue
            </Button>
          </FocusModal.Footer>
        </form>
      </FocusModal.Content>
    </FocusModal>
  )
}
