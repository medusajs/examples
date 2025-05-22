import { 
  AbstractNotificationProviderService
} from "@medusajs/framework/utils"
import { 
  ProviderSendNotificationDTO, 
  ProviderSendNotificationResultsDTO
} from "@medusajs/types"
import { Twilio } from "twilio"

type InjectedDependencies = {}

type TwilioSmsServiceOptions = {
  accountSid: string
  authToken: string
  from: string
}

class TwilioSmsService extends AbstractNotificationProviderService {
  static readonly identifier = "twilio-sms"
  private readonly client: Twilio
  private readonly from: string

  constructor(container: InjectedDependencies, options: TwilioSmsServiceOptions) {
    super()

    this.client = new Twilio(options.accountSid, options.authToken)
    this.from = options.from
  }

  static validateOptions(options: Record<any, any>): void | never {
    if (!options.accountSid) {
      throw new Error("Account SID is required")
    }
    if (!options.authToken) {
      throw new Error("Auth token is required")
    }
    if (!options.from) {
      throw new Error("From is required")
    }
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const { to, content, template, data } = notification
    const contentText = content?.text || await this.getTemplateContent(
      template, data
    )

    const message = await this.client.messages.create({
      body: contentText,
      from: this.from,
      to
    })

    return {
      id: message.sid,
    }
  }

  async getTemplateContent(template: string, data?: Record<string, unknown> | null): Promise<string> {
    switch (template) {
      case "otp-template":
        if (!data?.otp) {
          throw new Error("OTP is required for OTP template")
        }

        return `Your OTP is ${data.otp}`
      default:
        throw new Error(`Template ${template} not found`)
    }
  }
}

export default TwilioSmsService