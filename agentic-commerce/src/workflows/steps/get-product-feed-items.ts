import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { getVariantAvailability, QueryContext } from "@medusajs/framework/utils"
import { CalculatedPriceSet, ShippingOptionDTO } from "@medusajs/framework/types"

export type FeedItem = {
  id: string
  title: string
  description: string
  link: string
  image_link?: string
  additional_image_link?: string
  availability: string
  inventory_quantity: number
  price: string
  sale_price?: string
  item_group_id: string
  item_group_title: string
  gtin?: string
  condition?: string
  brand?: string
  product_category?: string
  material?: string
  weight?: string
  color?: string
  size?: string
  seller_name: string
  seller_url: string
  seller_privacy_policy: string
  seller_tos: string
  return_policy: string
  return_window?: number
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
        "sales_channels.stock_locations.address.*",
        "categories.*"
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

      const categories = product.categories?.map((cat) => cat?.name)
      .filter((name): name is string => !!name).join(">")

      for (const variant of product.variants) {
        // @ts-ignore
        const calculatedPrice = variant.calculated_price as CalculatedPriceSet
        const hasOriginalPrice = calculatedPrice?.original_amount !== calculatedPrice?.calculated_amount
        const originalPrice = hasOriginalPrice ? calculatedPrice.original_amount : calculatedPrice.calculated_amount
        const salePrice = hasOriginalPrice ? calculatedPrice.calculated_amount : undefined
        const stockStatus = !variant.manage_inventory ? "in stock" : 
          !availability?.[variant.id]?.availability ? "out of stock" : "in stock"
        const inventoryQuantity = !variant.manage_inventory ? 100000 : availability?.[variant.id]?.availability || 0
        const color = variant.options?.find((o) => o.option?.title.toLowerCase() === "color")?.value
        const size = variant.options?.find((o) => o.option?.title.toLowerCase() === "size")?.value

        feedItems.push({
          id: variant.id,
          title: product.title,
          description: product.description ?? "",
          link: `${storefrontUrl || ""}/${input.country_code}/${product.handle}`,
          image_link: product.thumbnail ?? "",
          additional_image_link: product.images?.map((image) => image.url)?.join(","),
          availability: stockStatus,
          inventory_quantity: inventoryQuantity,
          price: formatPrice(originalPrice as number, currencyCode),
          sale_price: salePrice ? formatPrice(salePrice as number, currencyCode) : undefined,
          item_group_id: product.id,
          item_group_title: product.title,
          gtin: variant.upc || undefined,
          condition: "new", // TODO add condition if supported
          product_category: categories,
          material: variant.material || undefined,
          weight: `${variant.weight || 0} kg`,
          brand: "", // TODO add brands if supported
          color: color || undefined,
          size: size || undefined,
          seller_name: "Medusa", // TODO add seller name if supported
          seller_url: storefrontUrl || "",
          seller_privacy_policy: `${storefrontUrl}/privacy-policy`, // TODO update
          seller_tos: `${storefrontUrl}/terms-of-service`, // TODO update
          return_policy: `${storefrontUrl}/return-policy`, // TODO update
          return_window: 0, // TODO update
        })
      }
    }
  } while (count > offset)

  return new StepResponse({ items: feedItems })
})