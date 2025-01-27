import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { 
  DetailWidgetProps, 
  AdminProduct,
} from "@medusajs/framework/types"

type WishlistResponse = {
  count: number
}

const ProductWidget = ({ 
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const { data, isLoading } = useQuery<WishlistResponse>({
    queryFn: () => sdk.client.fetch(`/admin/products/${product.id}/wishlist`),
    queryKey: [["products", product.id, "wishlist"]],
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Wishlist</Heading>
      </div>
      <Text className="px-6 py-4">
        {isLoading ? 
          "Loading..." : `This product is in ${data?.count} wishlist(s).`
        }
      </Text>
    </Container>
  )
}


export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default ProductWidget