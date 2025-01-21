import { clx, Heading } from "@medusajs/ui"
import { sdk } from "../../../lib/sdk"

type Params = {
  params: Promise<{ id: string }>
}

export default async function ConfirmationPage ({
  params
}: Params) {
  const orderId = (await params).id

  const { order } = await sdk.store.order.retrieve(orderId)

  return (
    <div className={clx(
      "bg-ui-bg-base rounded-lg py-4 px-6 w-full",
      "flex gap-4 flex-col shadow-elevation-card-rest"
    )}>
      <Heading level="h2">Thank you, {order.shipping_address?.first_name}!</Heading>
      <p className="text-ui-fg-subtle">Your order has been placed. We are working to get it settled.</p>
      <hr className="bg-ui-bg-subtle" />
      <div className="flex gap-2 flex-col">
        <span className="flex gap-1">
          <span className="text-sm text-ui-fg-muted">Order number:</span>
          <span className="text-sm text-ui-fg-base">{order.display_id}</span>
        </span>
        <span className="flex gap-1">
          <span className="text-sm text-ui-fg-muted">Order date:</span>
          <span className="text-sm text-ui-fg-base">{order.created_at.toString()}</span>
        </span>
      </div>
    </div>
  )
}