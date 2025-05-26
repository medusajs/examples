import { createStep } from "@medusajs/framework/workflows-sdk"

type TrackEventStepInput = {
  event: string
  userId?: string
  properties?: Record<string, unknown>
  timestamp?: Date
}

export const trackEventStep = createStep(
  "track-event",
  async (input: TrackEventStepInput, { container }) => {
    const analyticsModuleService = container.resolve(
      "analytics"
    )

    if (!input.userId) {
      // generate a random user id
      input.properties = {
        ...input.properties,
        anonymousId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      }
    }

    await analyticsModuleService.track({
      event: input.event,
      actor_id: input.userId,
      properties: input.properties,
    })
  }
)
