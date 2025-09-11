import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"

type BillingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const BillingDetails = ({ order }: BillingDetailsProps) => {
  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Billing Address
      </Heading>
      <div className="flex items-start gap-x-8">
        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-address-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            Billing Address
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.billing_address?.first_name}{" "}
            {order.billing_address?.last_name}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.billing_address?.address_1}{" "}
            {order.billing_address?.address_2}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.billing_address?.postal_code},{" "}
            {order.billing_address?.city}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.billing_address?.country_code?.toUpperCase()}
          </Text>
        </div>

        <div
          className="flex flex-col w-1/3 "
          data-testid="billing-contact-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Contact</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.billing_address?.phone}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">{order.email}</Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default BillingDetails
