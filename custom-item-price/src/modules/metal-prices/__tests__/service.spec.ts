import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { METAL_PRICES_MODULE } from ".."
import HelloModuleService from "../service"
import { MetalSymbols } from "../service"

moduleIntegrationTestRunner<HelloModuleService>({
  moduleName: METAL_PRICES_MODULE,
  moduleOptions: {
    accessToken: "test",
    sandbox: true,
  },
  resolve: "./src/modules/metal-prices",
  testSuite: ({ service }) => {
    describe("Get Metal Price", () => {
      it("should return a price", async () => {
        const price = await service.getMetalPrice(MetalSymbols.Gold, "eur")
        expect(price).toMatchObject({
          metal: MetalSymbols.Gold,
          currency: "eur",
          price: 10,
        })
      })
    })

    describe("Get Metal Symbols", () => {
      it("should return all metal symbols", async () => {
        const symbols = await service.getMetalSymbols()
        expect(symbols).toEqual(Object.values(MetalSymbols))
      })
    })

    describe("Get Metal Symbol", () => {
      it("should return a metal symbol", async () => {
        const symbol = await service.getMetalSymbol("gold")
        expect(symbol).toEqual(MetalSymbols.Gold)
      })

      it("should return undefined for invalid metal", async () => {
        const symbol = await service.getMetalSymbol("invalid")
        expect(symbol).toBeUndefined()
      })
    })
  },
})

jest.setTimeout(60 * 1000)