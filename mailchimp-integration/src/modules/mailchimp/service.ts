import { ProviderSendNotificationResultsDTO, ProviderSendNotificationDTO } from "@medusajs/framework/types"
import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import mailchimpMarketingApi from "@mailchimp/mailchimp_marketing"

type Options = {
  apiKey: string
  server: string
  listId: string
  templates?: {
    new_products?: {
      subject_line?: string
      storefront_url?: string
    }
  }
}

type InjectedDependencies = {
}

class MailchimpNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "mailchimp"
  protected options: Options
  protected mailchimp: typeof mailchimpMarketingApi

  constructor(container: InjectedDependencies, options: Options) {
    super()
    this.options = options
    this.mailchimp = mailchimpMarketingApi
    this.mailchimp.setConfig({
      apiKey: options.apiKey,
      server: options.server,
    })
  }

  static validateOptions(options: Record<any, any>): void | never {
    if (!options.apiKey) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, "API key is required")
    }
    if (!options.server) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, "Server is required")
    }
    if (!options.listId) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, "List ID is required")
    }
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const { template } = notification

    switch (template) {
      case "newsletter-signup":
        return this.sendNewsletterSignup(notification)
      case "new-products":
        return this.sendNewProducts(notification)
      default:
        throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, "Invalid template")
    }
  }

  async sendNewsletterSignup(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const { to, data } = notification

    try {
      const response = await this.mailchimp.lists.addListMember(this.options.listId, {
        email_address: to,
        status: "subscribed",
        merge_fields: {
          FNAME: data?.first_name,
          LNAME: data?.last_name,
        },
      })
  
      return {
        id: "id" in response ? response.id : "",
      }
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE, 
        `Failed to send newsletter signup: ${error.response.text}`
      )
    }
  }

  async sendNewProducts(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const { data } = notification

    try {
      const list = await fetch(`https://${this.options.server}.api.mailchimp.com/3.0/lists/${this.options.listId}`, {
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
        },
      }).then(res => res.json()) as mailchimpMarketingApi.lists.List

      // create a campaign
      const campaign = await this.mailchimp.campaigns.create({
        type: "regular",
        recipients: {
          list_id: this.options.listId,
        },
        settings: {
          subject_line: this.options.templates?.new_products?.subject_line || "New Products",
          from_name: list.campaign_defaults.from_name,
          reply_to: list.campaign_defaults.from_email,
        }
      }) as mailchimpMarketingApi.campaigns.Campaigns

      // set content
      await this.mailchimp.campaigns.setContent(campaign.id, {
        html: await this.getNewProductsHtmlContent(data),
      })

      // send campaign
      await this.mailchimp.campaigns.send(campaign.id)

      return {
        id: campaign.id,
      }
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE, 
        `Failed to send new products newsletter: ${error.response?.text || error}`
      )
    }
  }

  private async getNewProductsHtmlContent(data: any): Promise<string> {
    return `
      <!DOCTYPE html>
        <html xmlns:mc="http://schemas.mailchimp.com/2006/hcm">
        <head>
          <meta charset="UTF-8">
          <title>Product List</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              background: #ffffff;
              margin: 0 auto;
              padding: 20px;
            }
            .product {
              border-bottom: 1px solid #ddd;
              padding: 20px 0;
              display: flex;
            }
            .product img {
              max-width: 120px;
              margin-right: 20px;
            }
            .product-info {
              flex: 1;
            }
            .product-info h4 {
              margin: 0 0 10px;
              font-size: 18px;
            }
            .product-info p {
              margin: 0 0 5px;
              color: #555;
            }
            .cta-button {
              display: inline-block;
              margin-top: 10px;
              background-color: #007BFF;
              color: #ffffff;
              text-decoration: none;
              padding: 10px 15px;
              border-radius: 4px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 style="text-align:center;">Check out our latest products</h2>

            <!-- Repeatable product block -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" mc:repeatable="product_block" mc:variant="Product Item">
              <tbody>
                ${data.products.map((product: any) => `
                  <tr>
                    <td class="product">
                        <img mc:edit="product_image" src="${product.thumbnail}" alt="Product Image">
                        <div class="product-info">
                          <h4 mc:edit="product_title">${product.title}</h4>
                          <p mc:edit="product_description">${product.description}</p>
                          <a mc:edit="product_link" href="${this.options.templates?.new_products?.storefront_url}/products/${product.handle}" class="cta-button">View Product</a>
                        </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

          </div>
        </body>
        </html>
    `
  }
}

export default MailchimpNotificationProviderService