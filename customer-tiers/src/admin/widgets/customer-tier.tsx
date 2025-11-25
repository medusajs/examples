import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminCustomer } from "@medusajs/framework/types"
import { Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"

type AdminCustomerWithTier = AdminCustomer & {
  tier?: {
    id: string
    name: string
  }
}

const CustomerTierWidget = ({
  data: customer,
}: DetailWidgetProps<AdminCustomer>) => {
  const { data: customerData } = useQuery({
    queryFn: () =>
      sdk.admin.customer.retrieve(customer.id, {
        fields: "id,email,*tier",
      }),
    queryKey: ["customer", customer.id, "tier"],
  })

  const customerWithTier = customerData?.customer as AdminCustomerWithTier | undefined
  const tier = customerWithTier?.tier

  if (!tier) {
    return null
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Customer Tier</Heading>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          Tier
        </Text>
        <Text
          size="small"
          leading="compact"
          className="whitespace-pre-line text-pretty"
        >
          <Link
            to={`/tiers/${tier.id}`}
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
          >
            {tier.name}
          </Link>
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default CustomerTierWidget

