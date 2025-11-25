import { Code, Container, Heading, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"
import { Tier } from "../routes/tiers/page"
import { EditTierDrawer } from "./edit-tier-drawer"

type TierDetailsSectionProps = {
  tier: Tier | undefined
}

export const TierDetailsSection = ({ tier }: TierDetailsSectionProps) => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Tier Details</Heading>
        <div className="flex items-center gap-x-2">
          <EditTierDrawer tier={tier} />
        </div>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          Name
        </Text>

        <Text
          size="small"
          leading="compact"
          className="whitespace-pre-line text-pretty"
        >
          {tier?.name ?? "-"}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          Promotion
        </Text>

        {tier?.promotion && (
          <Link to={`/promotions/${tier.promotion.id}`}>
            <Code>{tier.promotion.code}</Code>
          </Link>
        )}
      </div>
    </Container>
  )
}

