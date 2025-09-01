import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { getVariantAvailability, QueryContext } from "@medusajs/framework/utils"
import { CalculatedPriceSet } from "@medusajs/framework/types"

export type FeedItem = {
  id: string
  title: string
  description: string
  link: string
  image_link?: string
  additional_image_link?: string
  availability: string
  price: string
  sale_price?: string
  item_group_id: string
  condition?: string
  brand?: string
}

type StepInput = {
  currency_code: string
  country_code: string
}

const formatPrice = (price: number, currency_code: string) => {
  return `${new Intl.NumberFormat("en-US", {
    currency: currency_code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)} ${currency_code.toUpperCase()}`
}

export const getProductFeedItemsStep = createStep(
  "get-product-feed-items", 
  async (input: StepInput, { container }) => {
  const feedItems: FeedItem[] = []
  const query = container.resolve("query")
  const configModule = container.resolve("configModule")
  const storefrontUrl = configModule.admin.storefrontUrl || process.env.STOREFRONT_URL

  const limit = 100
  let offset = 0
  let count = 0
  const countryCode = input.country_code.toLowerCase()
  const currencyCode = input.currency_code.toLowerCase()

  do {
    const {
      data: products,
      metadata
    } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "thumbnail",
        "images.*",
        "status",
        "variants.*",
        "variants.calculated_price.*",
        "sales_channels.*",
        "sales_channels.stock_locations.*",
        "sales_channels.stock_locations.address.*"
      ],
      filters: {
        status: "published",
      },
      context: {
        variants: {
          calculated_price: QueryContext({
            currency_code: currencyCode,
          }),
        }
      },
      pagination: {
        take: limit,
        skip: offset,
      }
    })
    
    count = metadata?.count ?? 0
    offset += limit

    for (const product of products) {
      if (!product.variants.length) continue
      const salesChannel = product.sales_channels?.find((channel) => {
        return channel?.stock_locations?.some((location) => {
          return location?.address?.country_code.toLowerCase() === countryCode
        })
      })

      const availability = salesChannel?.id ? await getVariantAvailability(query, {
        variant_ids: product.variants.map((variant) => variant.id),
        sales_channel_id: salesChannel?.id,
      }) : undefined

      for (const variant of product.variants) {
        // @ts-ignore
        const calculatedPrice = variant.calculated_price as CalculatedPriceSet
        const hasOriginalPrice = calculatedPrice?.original_amount !== calculatedPrice?.calculated_amount
        const originalPrice = hasOriginalPrice ? calculatedPrice.original_amount : calculatedPrice.calculated_amount
        const salePrice = hasOriginalPrice ? calculatedPrice.calculated_amount : undefined
        const stockStatus = !variant.manage_inventory ? "in stock" : 
          !availability?.[variant.id]?.availability ? "out of stock" : "in stock"

        feedItems.push({
          id: variant.id,
          title: product.title,
          description: product.description ?? "",
          link: `${storefrontUrl || ""}/${input.country_code}/${product.handle}`,
          image_link: product.thumbnail ?? "",
          additional_image_link: product.images?.map((image) => image.url)?.join(","),
          availability: stockStatus,
          price: formatPrice(originalPrice as number, currencyCode),
          sale_price: salePrice ? formatPrice(salePrice as number, currencyCode) : undefined,
          item_group_id: product.id,
          condition: "new", // TODO add condition if supported
          brand: "" // TODO add brands if supported
        })
      }
    }
  } while (count > offset)

  return new StepResponse({ items: feedItems })
})