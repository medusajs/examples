import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { StoreProductWithPayload } from "../../../../types/global"
// @ts-ignore
import { RichText } from '@payloadcms/richtext-lexical/react'

type ProductInfoProps = {
  product: StoreProductWithPayload
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product?.payload_product?.title || product.title}
        </Heading>

        {product?.payload_product?.description !== undefined && 
          <RichText data={product.payload_product.description} />}
        
        {product?.payload_product?.description === undefined && (
          <Text
            className="text-medium text-ui-fg-subtle whitespace-pre-line"
            data-testid="product-description"
          >
            {product.description}
          </Text>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
