import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ApiKeyDTO, CartDTO } from "@medusajs/framework/types"
import { createCartWorkflow, createProductsWorkflow } from "@medusajs/medusa/core-flows"
import seedDemoData from "../../src/scripts/seed"

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Add Custom to Cart Route", () => {
      let pak: ApiKeyDTO
      let cart: CartDTO
      beforeAll(async () => {
        const container = getContainer()
        await seedDemoData({ container, args: [] })
        const regionModuleService = container.resolve("region")
        const salesChannelModuleService = container.resolve("sales_channel")
        const apiKeyModuleService = container.resolve("api_key")
        const fulfillmentModuleService = container.resolve("fulfillment")

        const [defaultSalesChannel] = await salesChannelModuleService.listSalesChannels({
          name: "Default Sales Channel",
        })
        pak = (await apiKeyModuleService.listApiKeys({
          type: "publishable"
        }))[0]
        const [shippingProfile] = await fulfillmentModuleService.listShippingProfiles({
          name: "Default"
        })
        
        await createProductsWorkflow(container).run({
          input: {
            products: [
              {
                title: "Metal Product",
                options: [
                  {
                    title: "Metal",
                    values: ["Gold"]
                  }
                ],
                variants: [
                  {
                    title: "Gold Variant",
                    options: {
                      "Metal": "Gold"
                    },
                    weight: 1,
                    prices: [
                      {
                        currency_code: "eur",
                        amount: 0,
                      }
                    ],
                    manage_inventory: false,
                  },
                ],
                sales_channels: [
                  {
                    id: defaultSalesChannel.id,
                  }
                ],
                shipping_profile_id: shippingProfile.id,
                status: "published",
              },
            ]
          }
        })

        const [region] = await regionModuleService.listRegions({
          currency_code: "eur",
        })

        cart = (await createCartWorkflow(container).run({
          input: {
            region_id: region.id,
            sales_channel_id: defaultSalesChannel.id
          }
        })).result
      })
      it("adds item to cart", async () => {
        const container = getContainer()
        const productModuleService = container.resolve("product")
        const [variant] = await productModuleService.listProductVariants({
          // @ts-ignore
          title: "Gold Variant"
        })
        const response = await api.post(
          `/store/carts/${cart.id}/line-items-metals`,
          {
            variant_id: variant.id,
            quantity: 1
          },
          {
            headers: {
              "x-publishable-api-key": pak.token,
            }
          }
        )

        expect(response.status).toEqual(200)
        expect(response.data).toHaveProperty("cart")
        expect(response.data.cart).toMatchObject({
          items: [
            {
              variant_id: variant.id,
              quantity: 1
            }
          ]
        })
      })
    })
  },
})

jest.setTimeout(60 * 1000)