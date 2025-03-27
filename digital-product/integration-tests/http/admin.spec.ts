import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ShippingProfileDTO } from "@medusajs/framework/types"
import jwt from "jsonwebtoken"
import createDigitalProductWorkflow from "../../src/workflows/create-digital-product"
import FormData from "form-data"

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Admin endpoints", () => {
      const headers: Record<string, string> = {}
      let shippingProfile: ShippingProfileDTO
      beforeEach(async () => {
        const container = getContainer()
        
        const authModuleService = container.resolve("auth")
        const userModuleService = container.resolve("user")
        
        const user = await userModuleService.createUsers({
          email: "admin@medusa.js",
          
        })
        const authIdentity = await authModuleService.createAuthIdentities({
          provider_identities: [
            {
              provider: "emailpass",
              entity_id: "admin@medusa.js",
              provider_metadata: {
                password: "supersecret",
              },
            },
          ],
          app_metadata: {
            user_id: user.id,
          },
        })

        const token = jwt.sign(
          {
            actor_id: user.id,
            actor_type: "user",
            auth_identity_id: authIdentity.id,
          },
          "supersecret",
          {
            expiresIn: "1d",
          }
        )
      
        headers["authorization"] = `Bearer ${token}`
        const fulfillmentModuleService = container.resolve("fulfillment")
        shippingProfile = await fulfillmentModuleService.createShippingProfiles({
          name: "Default Shipping Profile",
          type: "default",
        })
      })

      describe("GET /admin/digital-products", () => {
        beforeEach(async () => {
          const container = getContainer()
          // create digital product
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
                        currency_code: "usd",
                      },
                    ],
                    options: {
                      Default: "Default",
                    }
                  },
                ],
                shipping_profile_id: shippingProfile.id,
              }
            }
          })
        })
        it("returns digital products", async () => {
          const response = await api.get("/admin/digital-products", {
            headers,
          })
  
          expect(response.status).toEqual(200)
          expect(response.data.digital_products).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                name: "Digital Product",
                medias: expect.arrayContaining([]),
                product_variant: expect.objectContaining({
                  title: "Digital Variant",
                })
              })
            ])
          )
        })
      })

      describe("POST /admin/digital-products", () => {
        it("creates a digital product", async () => {
          const response = await api.post("/admin/digital-products", {
            name: "Digital Product",
            medias: [
              {
                type: "main",
                file_id: "test_123",
                mime_type: "image/png",
              }
            ],
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
                      currency_code: "usd",
                    },
                  ],
                  options: {
                    Default: "Default",
                  }
                },
              ],
              shipping_profile_id: "",
            }
          }, {
            headers,
          })

          expect(response.status).toEqual(200)
          expect(response.data.digital_product).toEqual(
            expect.objectContaining({
              name: "Digital Product",
              medias: expect.arrayContaining([]),
            })
          )
        })
      })

      describe("POST /admin/digital-products/upload/:type", () => {
        it("Uploads a preview file", async () => {
          const form = new FormData()
          form.append("files", Buffer.from("content"), "image.jpg")

          const response = await api.post("/admin/digital-products/upload/preview", form, {
            headers: {
              ...headers,
              ...form.getHeaders(),
            },
          })

          expect(response.status).toEqual(200)
          expect(response.data.files).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                url: expect.any(String),
              })
            ])
          )
        })

        it("Uploads a main file", async () => {
          const form = new FormData()
          form.append("files", Buffer.from("content"), "image.jpg")

          const response = await api.post("/admin/digital-products/upload/main", form, {
            headers: {
              ...headers,
              ...form.getHeaders(),
            },
          })

          expect(response.status).toEqual(200)
          expect(response.data.files).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                url: expect.any(String),
              })
            ])
          )
        })
      })
    })
  },
})

jest.setTimeout(60 * 1000)