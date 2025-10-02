import crypto from "crypto"

export type AgenticCommerceWebhookEvent = {
  type: "order.created" | "order.updated"
  data: {
    type: "order"
    checkout_session_id: string
    permalink_url: string
    status: "created" | "manual_review" | "confirmed" | "canceled" | "shipping" | "fulfilled"
    refunds: {
      type: "store_credit" | "original_payment"
      amount: number
    }[]
  }
}

type ModuleOptions = {
  // TODO add module options like API key, etc.
  signatureKey: string
}

export default class AgenticCommerceService {
  options: ModuleOptions
  constructor({}, options: ModuleOptions) {
    this.options = options
    // TODO initialize client
  }

  async sendProductFeed(productFeed: string) {
    // TODO send product feed
    console.log(`Synced product feed ${productFeed}`)
  }

  async verifySignature({
    signature,
    payload
  }: {
    // base64 encoded signature
    signature: string
    payload: any
  }) {
    try {
      // Decode the base64 signature
      const receivedSignature = Buffer.from(signature, 'base64')
      
      // Create HMAC-SHA256 signature using your signing key
      const expectedSignature = crypto
        .createHmac('sha256', this.options.signatureKey)
        .update(JSON.stringify(payload), 'utf8')
        .digest()
      
      // Compare signatures using constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(receivedSignature, expectedSignature)
    } catch (error) {
      console.error('Signature verification failed:', error)
      return false
    }
  }

  async getSignature(data: any) {
    return Buffer.from(crypto.createHmac('sha256', this.options.signatureKey)
      .update(JSON.stringify(data), 'utf8').digest()).toString('base64')
  }

  async sendWebhookEvent({
    type,
    data
  }: AgenticCommerceWebhookEvent) {
    // Create signature
    const signature = this.getSignature(data)
    // TODO send order webhook event
    console.log(`Sent order webhook event ${type} with signature ${signature} and data ${JSON.stringify(data)}`)
  }
}