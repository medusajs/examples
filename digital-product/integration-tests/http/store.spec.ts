import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ApiKeyDTO } from "@medusajs/framework/types"
import { createApiKeysWorkflow } from "@medusajs/medusa/core-flows"
import seedDemoData from "../../src/scripts/seed"
import createDigitalProductWorkflow from "../../src/workflows/create-digital-product"

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    let pak: ApiKeyDTO
      beforeAll(async () => {
        pak = (await createApiKeysWorkflow(getContainer()).run({
          input: {
            api_keys: [
              {
                type: "publishable",
                title: "Test Key",
                created_by: "",
              },
            ],
          },
        })).result[0]
      })

    describe("Store routes", () => {
      describe("POST /store/carts/:id/complete", () => {
        let cart
        beforeEach(async () => {
          const container = getContainer()
          await seedDemoData({
            container: getContainer(),
            args: []
          })

          const salesChannelModule = container.resolve("sales_channel")
          const regionModule = container.resolve("region")
          const productModule = container.resolve("product")
          const fulfillmentModule = container.resolve("fulfillment")

          const [salesChannel] = await salesChannelModule.listSalesChannels({
            name: "Default Sales Channel"
          })
          const [region] = await regionModule.listRegions({
            name: "Europe"
          })
          const [shippingOption] = await fulfillmentModule.listShippingOptions({
            name: "Standard Shipping"
          })
          const [shippingProfile] = await fulfillmentModule.listShippingProfiles({
            name: "Default"
          })

          await createDigitalProductWorkflow(container).run({
            input: {
              digital_product: {
                name: "Digital Product",
                medias: [],
              },
              product: {
                title: "Digital Product",
                options: [
                  {
                    title: "Default",
                    values: ["Default"],
                  }
                ],
                variants: [
                  {
                    title: "Digital Variant",
                    prices: [
                      {
                        amount: 1000,
                        currency_code: "eur",
                      },
                    ],
                    options: {
                      Default: "Default",
                    },
                    manage_inventory: false,
                  },
                ],
                shipping_profile_id: shippingProfile.id,
                sales_channels: [
                  {
                    id: salesChannel.id
                  }
                ]
              }
            }
          })
          const [product] = await productModule.listProducts({
            title: "Digital Product"
          }, {
            relations: ["variants"]
          })


          cart = (await api.post(`/store/carts`, {
            currency_code: "eur",
            sales_channel_id: salesChannel.id,
            region_id: region.id,
            shipping_address: {
              address_1: "test address 1",
              address_2: "test address 2",
              city: "SF",
              country_code: "dk",
              province: "CA",
              postal_code: "94016",
            },
            items: [{ variant_id: product.variants[0].id, quantity: 1 }],
          }, {
            headers: {
              "x-publishable-api-key": pak.token,
            }
          })).data.cart

          await api.post(
            `/store/carts/${cart.id}/shipping-methods`,
            { option_id: shippingOption.id },
            {
              headers: {
                "x-publishable-api-key": pak.token,
              }
            }
          )

          const paymentCollection = (
            await api.post(
              `/store/payment-collections`,
              { cart_id: cart.id },
              {
                headers: {
                  "x-publishable-api-key": pak.token,
                }
              }
            )
          ).data.payment_collection

          await api.post(
            `/store/payment-collections/${paymentCollection.id}/payment-sessions`,
            { provider_id: "pp_system_default" },
            {
              headers: {
                "x-publishable-api-key": pak.token,
              }
            }
          )
        })
        it("creates digital product order", async () => {
          const response = await api.post(
            `/store/carts/${cart.id}/complete`, {},
            {
              headers: {
                "x-publishable-api-key": pak.token,
              }
            }
          )
  
          expect(response.status).toEqual(200)
          expect(response.data).toHaveProperty("type")
          expect(response.data.type).toEqual("order")
          expect(response.data).toHaveProperty("order")
          expect(response.data).toHaveProperty("digital_product_order")
        })
      })
    })
  },
})

jest.setTimeout(60 * 1000)