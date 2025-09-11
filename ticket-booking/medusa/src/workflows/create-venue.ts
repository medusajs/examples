import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createVenueStep } from "./steps/create-venue"
import { createVenueRowsStep } from "./steps/create-venue-rows"
import { RowType } from "../modules/ticket-booking/models/venue-row"
import { useQueryGraphStep } from "@medusajs/core-flows"

export type CreateVenueWorkflowInput = {
  name: string
  address?: string
  rows: Array<{
    row_number: string
    row_type: RowType
    seat_count: number
  }>
}

export const createVenueWorkflow = createWorkflow(
  "create-venue",
  (input: CreateVenueWorkflowInput) => {
    const venue = createVenueStep({
      name: input.name,
      address: input.address
    })

    const venueRowsData = transform({
      venue,
      input
    }, (data) => {
      return data.input.rows.map((row) => ({
        venue_id: data.venue.id,
        row_number: row.row_number,
        row_type: row.row_type,
        seat_count: row.seat_count
      }))
    })

    createVenueRowsStep({
      rows: venueRowsData
    })

    const { data: venues } = useQueryGraphStep({
      entity: "venue",
      fields: ["id", "name", "address", "rows.*"],
      filters: {
        id: venue.id,
      },
    })

    return new WorkflowResponse({
      venue: venues[0],
    })
  }
)
