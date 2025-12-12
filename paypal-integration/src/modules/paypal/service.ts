import { AbstractPaymentProvider, MedusaError, BigNumber, PaymentActions } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import {
  Client,
  Environment,
  OrdersController,
  PaymentsController,
  CheckoutPaymentIntent,
  OrderApplicationContextLandingPage,
  OrderApplicationContextUserAction,
  OrderStatus,
  PatchOp,
} from "@paypal/paypal-server-sdk"
import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  PaymentSessionStatus,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/framework/types"
import type { OrderRequest } from "@paypal/paypal-server-sdk"

type Options = {
  client_id: string
  client_secret: string
  environment?: "sandbox" | "production"
  autoCapture?: boolean
  webhook_id?: string
}

type InjectedDependencies = {
  logger: Logger
}

class PayPalPaymentProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "paypal"

  protected logger_: Logger
  protected options_: Options
  protected client_: Client
  protected ordersController_: OrdersController
  protected paymentsController_: PaymentsController

  constructor(container: InjectedDependencies, options: Options) {
    super(container, options)

    this.logger_ = container.logger
    this.options_ = {
      environment: "sandbox",
      autoCapture: false,
      ...options,
    }

    // Initialize PayPal client
    this.client_ = new Client({
      environment:
        this.options_.environment === "production"
          ? Environment.Production
          : Environment.Sandbox,
      clientCredentialsAuthCredentials: {
        oAuthClientId: this.options_.client_id,
        oAuthClientSecret: this.options_.client_secret,
      },
    })

    this.ordersController_ = new OrdersController(this.client_)
    this.paymentsController_ = new PaymentsController(this.client_)
  }

  static validateOptions(options: Record<any, any>): void | never {
    if (!options.client_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA, 
        "Client ID is required"
      )
    }
    if (!options.client_secret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA, 
        "Client secret is required"
      )
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    try {
      const { amount, currency_code } = input

      // Determine intent based on capture option
      const intent = this.options_.autoCapture
        ? CheckoutPaymentIntent.Capture
        : CheckoutPaymentIntent.Authorize

      // Create PayPal order request
      const orderRequest: OrderRequest = {
        intent: intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency_code.toUpperCase(),
              value: amount.toString(),
            },
            description: "Order payment",
            customId: input.data?.session_id as string | undefined,
          },
        ],
        applicationContext: {
          // TODO: Customize as needed
          brandName: "Store",
          landingPage: OrderApplicationContextLandingPage.NoPreference,
          userAction: OrderApplicationContextUserAction.PayNow,
        },
      }

      const response = await this.ordersController_.createOrder({
        body: orderRequest,
        prefer: "return=representation",
      })

      const order = response.result

      if (!order?.id) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Failed to create PayPal order"
        )
      }

      // Extract approval URL from links
      const approvalUrl = order.links?.find(
        (link) => link.rel === "approve"
      )?.href

      return {
        id: order.id,
        data: {
          order_id: order.id,
          intent: intent,
          status: order.status,
          approval_url: approvalUrl,
          session_id: input.data?.session_id,
          currency_code
        },
      }
    } catch (error: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to initiate PayPal payment: ${error.result?.message || error}`
      )
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    try {
      const orderId = input.data?.order_id as string | undefined

      if (!orderId || typeof orderId !== "string") {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "PayPal order ID is required"
        )
      }

      // If capture is enabled, authorize and capture in one step
      if (this.options_.autoCapture) {
        const response = await this.ordersController_.captureOrder({
          id: orderId,
          prefer: "return=representation",
        })

        const capture = response.result

        if (!capture?.id) {
          throw new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            "Failed to capture PayPal payment"
          )
        }

        // Extract capture ID from purchase units
        const captureId =
          capture.purchaseUnits?.[0]?.payments?.captures?.[0]?.id

        return {
          data: {
            ...input.data,
            capture_id: captureId,
            intent: "CAPTURE",
          },
          status: "captured" as PaymentSessionStatus,
        }
      }

      // Otherwise, just authorize
      const response = await this.ordersController_.authorizeOrder({
        id: orderId,
        prefer: "return=representation",
      })

      const authorization = response.result

      if (!authorization?.id) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Failed to authorize PayPal payment"
        )
      }

      // Extract authorization ID from purchase units
      const authId =
        authorization.purchaseUnits?.[0]?.payments?.authorizations?.[0]?.id

      return {
        data: {
          order_id: orderId,
          authorization_id: authId,
          intent: "AUTHORIZE",
          currency_code: input.data?.currency_code,
        },
        status: "authorized" as PaymentSessionStatus,
      }
    } catch (error: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to authorize PayPal payment: ${error.message || error}`
      )
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    try {
      const authorizationId = input.data?.authorization_id as string | undefined

      if (!authorizationId || typeof authorizationId !== "string") {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "PayPal authorization ID is required for capture"
        )
      }

      const response = await this.paymentsController_.captureAuthorizedPayment({
        authorizationId: authorizationId,
        prefer: "return=representation",
      })

      const capture = response.result

      if (!capture?.id) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Failed to capture PayPal payment"
        )
      }

      return {
        data: {
          ...input.data,
          capture_id: capture.id,
        },
      }
    } catch (error: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to capture PayPal payment: ${error.result?.message || error}`
      )
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    try {
      const captureId = input.data?.capture_id as string | undefined

      if (!captureId || typeof captureId !== "string") {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "PayPal capture ID is required for refund"
        )
      }

      const refundRequest = {
        amount: {
          currencyCode: (input.data?.currency_code as string | undefined)
            ?.toUpperCase() || "",
          value: new BigNumber(input.amount).numeric.toString(),
        }
      }

      const response = await this.paymentsController_.refundCapturedPayment({
        captureId: captureId,
        body: Object.keys(refundRequest).length > 0 ? refundRequest : undefined,
        prefer: "return=representation",
      })

      const refund = response.result

      if (!refund?.id) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Failed to refund PayPal payment"
        )
      }

      return {
        data: {
          ...input.data,
          refund_id: refund.id,
        },
      }
    } catch (error: any) {
      console.log(error)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to refund PayPal payment: ${error.result?.message || error}`
      )
    }
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    try {
      const orderId = input.data?.order_id as string | undefined

      if (!orderId) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "PayPal order ID is required"
        )
      }
      
      await this.ordersController_.patchOrder({
        id: orderId as string,
        body: [
          {
            op: PatchOp.Replace,
            path: "/purchase_units/@reference_id=='default'/amount/value",
            value: new BigNumber(input.amount).numeric.toString(),
          }
        ]
      })

      return {
        data: {
          ...input.data,
          currency_code: input.currency_code,
        },
      }
    } catch (error: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to update PayPal payment: ${error.result?.message || error}`
      )
    }
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    // Note: PayPal doesn't have a cancelOrder API endpoint
    // Orders can only be voided if they're authorized, which is handled in cancelPayment
    // For orders that haven't been authorized yet, they will expire automatically

    return {
      data: input.data,
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    try {
      const orderId = input.data?.order_id as string | undefined

      if (!orderId || typeof orderId !== "string") {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "PayPal order ID is required"
        )
      }

      const response = await this.ordersController_.getOrder({
        id: orderId,
      })

      const order = response.result

      if (!order?.id) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "PayPal order not found"
        )
      }

      return {
        data: {
          order_id: order.id,
          status: order.status,
          intent: order.intent,
        },
      }
    } catch (error: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to retrieve PayPal payment: ${error.result?.message || error}`
      )
    }
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    try {
      const authorizationId = input.data?.authorization_id as string | undefined

      if (!authorizationId || typeof authorizationId !== "string") {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "PayPal authorization ID is required for cancellation"
        )
      }

      await this.paymentsController_.voidPayment({
        authorizationId: authorizationId,
      })

      return {
        data: input.data,
      }
    } catch (error: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to cancel PayPal payment: ${error.result?.message || error}`
      )
    }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    try {
      const orderId = input.data?.order_id as string | undefined

      if (!orderId || typeof orderId !== "string") {
        return { status: "pending" as PaymentSessionStatus }
      }

      const response = await this.ordersController_.getOrder({
        id: orderId,
      })

      const order = response.result

      if (!order) {
        return { status: "pending" as PaymentSessionStatus }
      }

      const status = order.status

      switch (status) {
        case OrderStatus.Created:
        case OrderStatus.Saved:
          return { status: "pending" as PaymentSessionStatus }
        case OrderStatus.Approved:
          return { status: "authorized" as PaymentSessionStatus }
        case OrderStatus.Completed:
          return { status: "authorized" as PaymentSessionStatus }
        case OrderStatus.Voided:
          return { status: "canceled" as PaymentSessionStatus }
        default:
          return { status: "pending" as PaymentSessionStatus }
      }
    } catch (error: any) {
      return { status: "pending" as PaymentSessionStatus }
    }
  }

  private async verifyWebhookSignature(
    headers: Record<string, any>,
    body: any,
    rawBody: string | Buffer | undefined
  ): Promise<boolean> {
    try {
      if (!this.options_.webhook_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "PayPal webhook ID is required for webhook signature verification"
        )
      }
  
      const transmissionId =
        headers["paypal-transmission-id"]
      const transmissionTime =
        headers["paypal-transmission-time"]
      const certUrl =
        headers["paypal-cert-url"]
      const authAlgo =
        headers["paypal-auth-algo"]
      const transmissionSig =
        headers["paypal-transmission-sig"]
  
      if (
        !transmissionId ||
        !transmissionTime ||
        !certUrl ||
        !authAlgo ||
        !transmissionSig
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Missing required PayPal webhook headers"
        )
      }
  
      // PayPal's API endpoint for webhook verification
      const baseUrl =
        this.options_.environment === "production"
          ? "https://api.paypal.com"
          : "https://api.sandbox.paypal.com"
  
      const verifyUrl = `${baseUrl}/v1/notifications/verify-webhook-signature`
  
      // Get access token for verification API call
      const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${this.options_.client_id}:${this.options_.client_secret}`
          ).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      })
  
      if (!authResponse.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Failed to get access token for webhook verification"
        )
      }
  
      const authData = await authResponse.json()
      const accessToken = authData.access_token
  
      if (!accessToken) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Access token not received from PayPal"
        )
      }
  
      let webhookEvent: any
      if (rawBody) {
        const rawBodyString =
          typeof rawBody === "string" ? rawBody : rawBody.toString("utf8")
        try {
          webhookEvent = JSON.parse(rawBodyString)
        } catch (e) {
          this.logger_.warn("Raw body is not valid JSON, using parsed body")
          webhookEvent = body
        }
      } else {
        this.logger_.warn(
          "Raw body not available, using parsed body. Verification may fail if formatting differs."
        )
        webhookEvent = body
      }
  
      const verifyPayload = {
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: this.options_.webhook_id,
        webhook_event: webhookEvent,
      }
  
      const verifyResponse = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(verifyPayload),
      })
  
      if (!verifyResponse.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Webhook verification API call failed"
        )
      }
  
      const verifyData = await verifyResponse.json()
  
      // PayPal returns verification_status: "SUCCESS" if verification passes
      const isValid = verifyData.verification_status === "SUCCESS"
  
      if (!isValid) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Webhook signature verification failed"
        )
      }
  
      return isValid
    } catch (e) {
      this.logger_.error("PayPal verifyWebhookSignature error:", e)
      return false
    }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    try {
      const { data, rawData, headers } = payload

      // Verify webhook signature
      const isValid = await this.verifyWebhookSignature(
        headers || {},
        data,
        rawData || ""
      )

      if (!isValid) {
        this.logger_.error("Invalid PayPal webhook signature")
        return {
          action: "failed",
          data: {
            session_id: "",
            amount: new BigNumber(0),
          },
        }
      }

      // PayPal webhook events have event_type
      const eventType = (data as any)?.event_type

      if (!eventType) {
        this.logger_.warn("PayPal webhook event missing event_type")
        return {
          action: "not_supported",
          data: {
            session_id: "",
            amount: new BigNumber(0),
          },
        }
      }

      // Extract order ID and amount from webhook payload
      const resource = (data as any)?.resource
      let sessionId: string | undefined = (data as any)?.resource?.custom_id

      if (!sessionId) {
        this.logger_.warn("Session ID not found in PayPal webhook resource")
        return {
          action: "not_supported",
          data: {
            session_id: "",
            amount: new BigNumber(0),
          },
        }
      }

      const amountValue =
        resource?.amount?.value ||
        resource?.purchase_units?.[0]?.payments?.captures?.[0]?.amount
          ?.value ||
        resource?.purchase_units?.[0]?.payments?.authorizations?.[0]
          ?.amount?.value ||
        0

      const amount = new BigNumber(amountValue)
      const payloadData = {
        session_id: sessionId,
        amount,
      }

      // Map PayPal webhook events to Medusa actions
      switch (eventType) {
        case "PAYMENT.AUTHORIZATION.CREATED":
          return {
            action: PaymentActions.AUTHORIZED,
            data: payloadData,
          }

        case "PAYMENT.CAPTURE.DENIED":
          return {
            action: PaymentActions.FAILED,
            data: payloadData,
          }

        case "PAYMENT.AUTHORIZATION.VOIDED":
          return {
            action: PaymentActions.CANCELED,
            data: payloadData,
          }
        
        case "PAYMENT.CAPTURE.COMPLETED":
          return {
            action: PaymentActions.SUCCESSFUL,
            data: payloadData,
          }

        default:
          this.logger_.info(`Unhandled PayPal webhook event: ${eventType}`)
          return {
            action: PaymentActions.NOT_SUPPORTED,
            data: payloadData,
          }
      }
    } catch (error: any) {
      this.logger_.error("PayPal getWebhookActionAndData error:", error.result?.message || error)
      return {
        action: "failed",
        data: {
          session_id: "",
          amount: new BigNumber(0),
        },
      }
    }
  }
}

export default PayPalPaymentProviderService
