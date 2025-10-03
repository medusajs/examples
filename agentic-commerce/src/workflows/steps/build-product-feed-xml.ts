import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FeedItem } from "./get-product-feed-items"

type StepInput = {
  items: FeedItem[]
}

export const buildProductFeedXmlStep = createStep(
  "build-product-feed-xml",
  async (input: StepInput) => {
    const escape = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&apos;")

    const itemsXml = input.items.map((item) => {
      return (
        `<item>` +
          // Flags 
          `<enable_search>true</enable_search>` +
          `<enable_checkout>true</enable_checkout>` +
          // Product Variant Fields
          `<id>${escape(item.id)}</id>` +
          `<title>${escape(item.title)}</title>` +
          `<description>${escape(item.description)}</description>` +
          `<link>${escape(item.link)}</link>` +
          `<gtin>${escape(item.gtin || "")}</gtin>` +
          (item.image_link ? `<image_link>${escape(item.image_link)}</image_link>` : "") +
          (item.additional_image_link ? `<additional_image_link>${escape(item.additional_image_link)}</additional_image_link>` : "") +
          `<availability>${escape(item.availability)}</availability>` +
          `<inventory_quantity>${item.inventory_quantity}</inventory_quantity>` +
          `<price>${escape(item.price)}</price>` +
          (item.sale_price ? `<sale_price>${escape(item.sale_price)}</sale_price>` : "") +
          `<condition>${escape(item.condition || "new")}</condition>` +
          `<product_category>${escape(item.product_category || "")}</product_category>` +
          `<brand>${escape(item.brand || "Medusa")}</brand>` +
          `<material>${escape(item.material || "")}</material>` +
          `<weight>${escape(item.weight || "")}</weight>` +
          `<item_group_id>${escape(item.item_group_id)}</item_group_id>` +
          `<item_group_title>${escape(item.item_group_title)}</item_group_title>` +
          `<size>${escape(item.size || "")}</size>` +
          `<color>${escape(item.color || "")}</color>` +
          `<seller_name>${escape(item.seller_name)}</seller_name>` +
          `<seller_url>${escape(item.seller_url)}</seller_url>` +
          `<seller_privacy_policy>${escape(item.seller_privacy_policy)}</seller_privacy_policy>` +
          `<seller_tos>${escape(item.seller_tos)}</seller_tos>` +
          `<return_policy>${escape(item.return_policy)}</return_policy>` +
          `<return_window>${item.return_window}</return_window>` +
        `</item>`
      )
    }).join("")

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
        `<channel>` +
          `<title>Product Feed</title>` +
          `<description>Product Feed for Agentic Commerce</description>` +
          itemsXml +
        `</channel>` +
      `</rss>`

    return new StepResponse(xml)
  }
)