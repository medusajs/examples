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
          `<g:id>${escape(item.id)}</g:id>` +
          `<title>${escape(item.title)}</title>` +
          `<description>${escape(item.description)}</description>` +
          `<link>${escape(item.link)}</link>` +
          (item.image_link ? `<g:image_link>${escape(item.image_link)}</g:image_link>` : "") +
          (item.additional_image_link ? `<g:additional_image_link>${escape(item.additional_image_link)}</g:additional_image_link>` : "") +
          `<g:availability>${escape(item.availability)}</g:availability>` +
          `<g:price>${escape(item.price)}</g:price>` +
          (item.sale_price ? `<g:sale_price>${escape(item.sale_price)}</g:sale_price>` : "") +
          `<g:condition>${escape(item.condition || "new")}</g:condition>` +
          `<g:brand>${escape(item.brand || "Medusa")}</g:brand>` +
          `<g:item_group_id>${escape(item.item_group_id)}</g:item_group_id>` +
        `</item>`
      )
    }).join("")

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
        `<channel>` +
          `<title>Product Feed</title>` +
          `<description>Product Feed for Social Platforms</description>` +
          itemsXml +
        `</channel>` +
      `</rss>`

    return new StepResponse(xml)
  }
)