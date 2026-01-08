import { LoaderOptions } from "@medusajs/framework/types"
import { asValue } from "@medusajs/framework/awilix"
import { createClient } from "contentful-management"
import { MedusaError } from "@medusajs/framework/utils"

const { createClient: createDeliveryClient } = require("contentful")

export type ModuleOptions = {
  management_access_token: string
  delivery_token: string
  space_id: string
  environment: string
  default_locale?: string
  webhook_secret?: string
}

export default async function syncContentModelsLoader({
  container,
  options,
}: LoaderOptions<ModuleOptions>) {
  if (
    !options?.management_access_token || !options?.delivery_token || 
    !options?.space_id || !options?.environment
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Contentful access token, space ID and environment are required"
    )
  }

  const logger = container.resolve("logger")

  try {
    const managementClient = createClient({
      accessToken: options.management_access_token,
    }, {
      type: "plain",
      defaults: {
        spaceId: options.space_id,
        environmentId: options.environment,
      }
    })

    const deliveryClient = createDeliveryClient({
      accessToken: options.delivery_token,
      space: options.space_id,
      environment: options.environment,
    })


    // Try to create the product content type
    try {
      await managementClient.contentType.get({
        contentTypeId: "product",
      })
    } catch (error) {
      const productContentType = await managementClient.contentType.createWithId({
        contentTypeId: "product",
      }, {
        name: "Product",
        description: "Product content type synced from Medusa",
        displayField: "title",
        fields: [
          {
            id: "title", 
            name: "Title",
            type: "Symbol",
            required: true,
            localized: true
          },
          {
            id: "handle",
            name: "Handle", 
            type: "Symbol",
            required: true,
            localized: false
          },
          {
            id: "medusaId",
            name: "Medusa ID",
            type: "Symbol",
            required: true,
            localized: false
          },
          {
            type: "RichText",
            name: "description", 
            id: "description",
            validations: [
              {
                enabledMarks: [
                  "bold",
                  "italic",
                  "underline", 
                  "code",
                  "superscript",
                  "subscript",
                  "strikethrough"
                ],
              },
              {
                enabledNodeTypes: [
                  "heading-1",
                  "heading-2", 
                  "heading-3",
                  "heading-4",
                  "heading-5",
                  "heading-6",
                  "ordered-list",
                  "unordered-list",
                  "hr",
                  "blockquote",
                  "embedded-entry-block",
                  "embedded-asset-block",
                  "table",
                  "asset-hyperlink",
                  "embedded-entry-inline",
                  "entry-hyperlink",
                  "hyperlink"
                ],
              },
              {
                nodes: {}
              }
            ],
            localized: true,
            required: true
          },
          {
            type: "Symbol",
            name: "subtitle",
            id: "subtitle",
            localized: true,
            required: false,
            validations: []
          },
          {
            type: "Array",
            items: {
              type: "Link",
              linkType: "Asset",
              validations: []
            },
            name: "images",
            id: "images",
            localized: true,
            required: false,
            validations: []
          },
          {
            id: "productVariants",
            name: "Product Variants",
            type: "Array",
            localized: false,
            required: false,
            items: {
              type: "Link",
              validations: [
                {
                  linkContentType: ["productVariant"]
                }
              ],
              linkType: "Entry"
            },
            disabled: false,
            omitted: false,
          },
          {
            id: "productOptions",
            name: "Product Options",
            type: "Array",
            localized: false,
            required: false,
            items: {
              type: "Link",
              validations: [
                {
                  linkContentType: ["productOption"]
                }
              ],
              linkType: "Entry"
            },
            disabled: false,
            omitted: false,
          }
        ]
      })

      await managementClient.contentType.publish({
        contentTypeId: "product",
      }, productContentType)
    }

    // Try to create the product variant content type
    try {
      await managementClient.contentType.get({
        contentTypeId: "productVariant",
      })
    } catch (error) {
      const productVariantContentType = await managementClient.contentType.createWithId({
        contentTypeId: "productVariant",
      }, {
      name: "Product Variant",
      description: "Product variant content type synced from Medusa",
      displayField: "title",
      fields: [
        {
          id: "title",
          name: "Title",
          type: "Symbol",
          required: true,
          localized: true
        },
        {
          id: "product",
          name: "Product",
          type: "Link",
          required: true,
          localized: false,
          validations: [
            {
              linkContentType: ["product"]
            }
          ],
          disabled: false,
          omitted: false,
          linkType: "Entry"
        },
        {
          id: "medusaId",
          name: "Medusa ID",
          type: "Symbol",
          required: true,
          localized: false,
        },
        {
          id: "productOptionValues",
          name: "Product Option Values",
          type: "Array",
          localized: false,
          required: false,
          items: {
            type: "Link",
            validations: [
              {
                linkContentType: ["productOptionValue"]
              }
            ],
            linkType: "Entry"
          },
          disabled: false,
          omitted: false,
          }
        ]
      })

      await managementClient.contentType.publish({
        contentTypeId: "productVariant",
      }, productVariantContentType)
    }

    // Try to create the product option content type
    try {
      await managementClient.contentType.get({
        contentTypeId: "productOption",
      })
    } catch (error) {
      const productOptionContentType = await managementClient.contentType.createWithId({
        contentTypeId: "productOption",
      }, {
        name: "Product Option",
        description: "Product option content type synced from Medusa",
        displayField: "title",
        fields: [
        {
          id: "title",
          name: "Title",
          type: "Symbol",
          required: true,
          localized: true
        },
        {
          id: "product",
          name: "Product",
          type: "Link",
          required: false,
          localized: false,
          validations: [
            {
              linkContentType: ["product"]
            }
          ],
          disabled: false,
          omitted: false,
          linkType: "Entry"
        },
        {
          id: "medusaId",
          name: "Medusa ID",
          type: "Symbol",
          required: true,
          localized: false
        },
        {
          id: "values",
          name: "Values",
          type: "Array",
          required: false,
          localized: false,
          items: {
            type: "Link",
            validations: [
              {
                linkContentType: ["productOptionValue"]
              }
            ],
            linkType: "Entry"
          },
          disabled: false,
          omitted: false,
          }
        ]
      })

      await managementClient.contentType.publish({
        contentTypeId: "productOption",
      }, productOptionContentType)
    }

    // Try to create the product option value content type
    try {
      await managementClient.contentType.get({
        contentTypeId: "productOptionValue",
      })
    } catch (error) {
      const productOptionValueContentType = await managementClient.contentType.createWithId({
        contentTypeId: "productOptionValue",
      }, {
        name: "Product Option Value",
        description: "Product option value content type synced from Medusa",
        displayField: "value",
        fields: [
        {
          id: "value",
          name: "Value",
          type: "Symbol",
          required: true,
          localized: true
        },
        {
          id: "medusaId",
          name: "Medusa ID",
          type: "Symbol",
          required: true,
          localized: false
        },
      ]
    })

    await managementClient.contentType.publish({
        contentTypeId: "productOptionValue",
      }, productOptionValueContentType)
    }

    container.register({
      contentfulManagementClient: asValue(managementClient),
      contentfulDeliveryClient: asValue(deliveryClient),
    })

    logger.info("Connected to Contentful")

  } catch (error) {
    logger.error(
      `Failed to connect to Contentful: ${error}`
    )
    throw error
  }
}
