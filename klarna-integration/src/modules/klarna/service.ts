import { 
  AuthorizePaymentInput, 
  AuthorizePaymentOutput, 
  CancelPaymentInput, 
  CancelPaymentOutput, 
  CapturePaymentInput, 
  CapturePaymentOutput, 
  DeletePaymentInput, 
  DeletePaymentOutput, 
  GetPaymentStatusInput, 
  GetPaymentStatusOutput, 
  InitiatePaymentInput, 
  InitiatePaymentOutput, 
  ProviderWebhookPayload, 
  RefundPaymentInput, 
  RefundPaymentOutput, 
  RetrievePaymentInput, 
  RetrievePaymentOutput, 
  UpdatePaymentInput, 
  UpdatePaymentOutput, 
  WebhookActionResult
} from "@medusajs/framework/types"
import { AbstractPaymentProvider, BigNumber, MedusaError } from "@medusajs/framework/utils"
import axios, { AxiosInstance } from "axios"

type Options = {
  baseUrl: string
  username: string
  password: string
  auto_capture?: boolean
  merchant_urls: {
    authorization: string
    [key: string]: string
  }
}

class KlarnaPaymentProviderService extends AbstractPaymentProvider<
  Options
> {
  static identifier = "klarna"
  private options: Options
  private client: AxiosInstance

  constructor(container, options: Options) {
    super(container, options)
    this.options = options
    this.client = axios.create({
      baseURL: options.baseUrl,
      auth: {
        username: options.username,
        password: options.password,
      },
    })
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.baseUrl) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "baseUrl is required")
    }
    if (!options.username) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "username is required")
    }
    if (!options.password) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "password is required")
    }
    if (!options.merchant_urls?.authorization) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "authorization is required")
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const {
      amount,
      currency_code,
      context,
      data
    } = input

    const normalizedAmount = new BigNumber(amount).bigNumber?.multipliedBy(100).toNumber()

    try {
      const { data: response } = await this.client.post(`/payments/v1/sessions`, {
        locale: data?.locale || "en-FR",
        purchase_country: data?.country_code || context?.customer?.billing_address?.country_code || "FR",
        purchase_currency: currency_code || "EUR",
        order_amount: normalizedAmount,
        order_tax_amount: 0,
        order_lines: [
          {
            name: "Item",
            quantity: 1,
            total_amount: normalizedAmount,
            unit_price: normalizedAmount,
            total_tax_amount: 0,
            tax_rate: 0,
          }
        ],
        intent: "buy",
        merchant_urls: this.options.merchant_urls,
        merchant_reference1: context?.idempotency_key,
      })

      return {
        id: response.session_id,
        data: response,
      }
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to initiate Klarna payment: ${error.response.data}`)
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const {
      data,
    } = input

    if (!data?.session_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "session_id is required to authorize payment")
    }

    try {
      // retrieve authorization token from session
      const { data: sessionResponse } = await this.client.get(`/payments/v1/sessions/${data.session_id}`)

      if (!sessionResponse.authorization_token) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "authorization_token is required to authorize payment")
      }

      const { data: response } = await this.client.post(`/payments/v1/authorizations/${sessionResponse.authorization_token}/order`, {
        order_amount: sessionResponse.order_amount,
        order_lines: sessionResponse.order_lines,
        purchase_currency: sessionResponse.purchase_currency,
        purchase_country: sessionResponse.purchase_country,
        locale: sessionResponse.locale,
        shipping_address: sessionResponse.shipping_address,
        billing_address: sessionResponse.billing_address,
        merchant_urls: this.options.merchant_urls,
        auto_capture: this.options.auto_capture,
      })

      return {
        data: {
          order_id: response.order_id,
        },
        status: "authorized",
      }

    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to authorize Klarna payment: ${error.response.data}`)
    }
  }

  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    const {
      data,
    } = payload

    // TODO: validate secret

    try {
      // retrieve session
      const { data: sessionResponse } = await this.client.get(`/payments/v1/sessions/${data.session_id}`)

      return {
        action: sessionResponse.status === "complete" ? 
          this.options.auto_capture ? 
            "captured" : "authorized" 
          : "pending",
        data: {
          session_id: sessionResponse.merchant_reference1,
          amount: new BigNumber(sessionResponse.order_amount as number).bigNumber?.dividedBy(100)!,
        },
      }
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to get Klarna webhook action and data: ${error.response.data}`)
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const {
      data,
      context
    } = input

    if (!data?.order_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "order_id is required to capture payment")
    }

    try {
      // retrieve order
      const { data: orderResponse } = await this.client.get(`/ordermanagement/v1/orders/${data.order_id}`)

      if (orderResponse.status !== "CAPTURED" && orderResponse.status !== "PARTIALLY_CAPTURED") {
        await this.client.post(`/ordermanagement/v1/orders/${data.order_id}/captures`, {
          captured_amount: orderResponse.remaining_authorized_amount,
        }, {
          headers: {
            "Klarna-Idempotency-Key": context?.idempotency_key || "",
          }
        })
      }

      return {
        data,
      }
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to capture Klarna payment: ${error.response.data}`)
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const {
      data,
      context
    } = input

    if (!data?.order_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "order_id is required to cancel payment")
    }

    try {
      await this.client.post(`/ordermanagement/v1/orders/${data.order_id}/cancel`, undefined, {
        headers: {
          "Klarna-Idempotency-Key": context?.idempotency_key || "",
        }
      })

      return {
        data,
      }
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to cancel Klarna payment: ${error.response.data}`)
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    const {
      data
    } = input

    if (!data?.session_id) {
      // no payment to delete
      return {
        data,
      }
    }

    const { data: sessionResponse } = await this.client.get(`/payments/v1/sessions/${data.session_id}`)

    if (!sessionResponse.authorization_token) {
      // no authorization to cancel
      return {
        data,
      }
    }

    try {
      await this.client.delete(`/payments/v1/authorizations/${sessionResponse.authorization_token}`)

      return {
        data,
      }
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to delete Klarna payment: ${error.response.data}`)
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const {
      data
    } = input
    
    if (!data?.session_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "session_id is required to get payment status")
    }

    try {
      const { data: response } = await this.client.get(`/payments/v1/sessions/${data.session_id}`)

      return {
        status: response.status === "completed" ? 
          this.options.auto_capture ? 
            "captured" : "authorized" 
          : response.status,
      }
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to get Klarna payment status: ${error.response.data}`)
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const {
      data,
      amount,
      context
    } = input
    
    if (!data?.order_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "order_id is required to refund payment")
    }

    const normalizedAmount = new BigNumber(amount).bigNumber?.multipliedBy(100).toNumber()

    try {
      await this.client.post(`/ordermanagement/v1/orders/${data.order_id}/refunds`, {
        refunded_amount: normalizedAmount,
      }, {
        headers: {
          "Klarna-Idempotency-Key": context?.idempotency_key || "",
        }
      })

      return {
        data,
      }
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to refund Klarna payment: ${error.response.data}`)
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const {
      data
    } = input

    if (!data?.order_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "order_id is required to retrieve payment")
    }

    try {
      const { data: response } = await this.client.get(`/ordermanagement/v1/orders/${data.order_id}`)

      return {
        data: response,
      }
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to retrieve Klarna payment: ${error.response.data}`)
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const {
      data,
      amount,
      context,
      currency_code
    } = input

    if (!data?.session_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "session_id is required to update payment")
    }

    const normalizedAmount = new BigNumber(amount).bigNumber?.multipliedBy(100).toNumber()

    try {
      const { data: response } = await this.client.post(`/payments/v1/sessions/${data.session_id}`, {
        locale: data?.locale,
        purchase_country: data?.country_code || context?.customer?.billing_address?.country_code,
        purchase_currency: currency_code,
        order_amount: normalizedAmount,
        order_lines: [
          {
            name: "Item",
            quantity: 1,
            total_amount: normalizedAmount,
            unit_price: normalizedAmount,
            total_tax_amount: 0,
            tax_rate: 0,
          }
        ],
        intent: "buy",
        merchant_urls: this.options.merchant_urls,
        merchant_reference1: context?.idempotency_key,
      })

      return {
        data: response,
      }
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to update Klarna payment: ${error.response.data}`)
    }
  }
}

export default KlarnaPaymentProviderService