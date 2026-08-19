import crypto from "crypto"
import AgenticCommerceService from "../service"

describe("AgenticCommerceService", () => {
  it("preserves the base64 signature used for inbound requests", async () => {
    const service = new AgenticCommerceService({}, {
      signatureKey: "test_secret",
    })
    const payload = { id: "checkout_123" }
    const expectedSignature = crypto
      .createHmac("sha256", "test_secret")
      .update(JSON.stringify(payload), "utf8")
      .digest("base64")

    await expect(service.getSignature(payload)).resolves.toBe(
      expectedSignature
    )
  })

  it("creates an ACP 2026-04-17 Merchant-Signature header", () => {
    const service = new AgenticCommerceService({}, {
      signatureKey: "test_secret",
    })
    const timestamp = 1_700_000_000
    const rawBody = JSON.stringify({
      type: "order_create",
      data: { id: "ord_123" },
    })
    const expectedDigest = crypto
      .createHmac("sha256", "test_secret")
      .update(`${timestamp}.${rawBody}`, "utf8")
      .digest("hex")

    expect(service.getWebhookSignature(rawBody, timestamp)).toBe(
      `t=${timestamp},v1=${expectedDigest}`
    )
  })

  it("signs the exact raw body", () => {
    const service = new AgenticCommerceService({}, {
      signatureKey: "test_secret",
    })
    const timestamp = 1_700_000_000

    expect(
      service.getWebhookSignature('{"a":1,"b":2}', timestamp)
    ).not.toBe(
      service.getWebhookSignature('{"b":2,"a":1}', timestamp)
    )
  })
})
