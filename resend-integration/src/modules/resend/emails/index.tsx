import OrderPlacedEmail, { OrderPlacedEmailProps } from "./order-placed";

export enum Templates {
  ORDER_PLACED = "order-placed",
}

const templates: Record<Templates, (props: unknown) => React.ReactNode> = {
  [Templates.ORDER_PLACED]: (props: OrderPlacedEmailProps) => (
    <OrderPlacedEmail {...props} />
  )
}

export default templates