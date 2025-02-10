import { Logger } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { MagentoCategory } from "./types"

type Options = {
  baseUrl: string
  username: string
  password: string
  migrationOptions?: {
    migrateDefaultCategory?: boolean
  }
}

type InjectedDependencies = {
  logger: Logger
}

export default class MagentoModuleService {
  private logger: Logger
  private options: Options
  private accessToken: {
    token: string
    expiresAt: Date
  }

  constructor(container: InjectedDependencies, options: Options) {
    this.logger = container.logger
    this.options = options
  }

  async authenticate() {
    const response = await fetch(`${this.options.baseUrl}/rest/default/V1/integration/admin/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: this.options.username, password: this.options.password }),
    })

    const token = await response.text()

    if (!response.ok) {
      throw new MedusaError(MedusaError.Types.UNAUTHORIZED, `Failed to authenticate with Magento: ${token}`)
    }

    this.accessToken = {
      token,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours in milliseconds
    }
  }

  async isAccessTokenExpired() {
    return this.accessToken.expiresAt < new Date()
  }

  async getCategories(): Promise<MagentoCategory[]> {
    const getAccessToken = !this.accessToken || await this.isAccessTokenExpired()
    if (getAccessToken) {
      await this.authenticate()
    }

    const category: MagentoCategory = await fetch(`${this.options.baseUrl}/rest/default/V1/categories`, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
      },
    }).then(res => res.json())
    .catch(err => {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to get categories from Magento: ${err.message}`)
    })

    if (!this.options.migrationOptions?.migrateDefaultCategory) {
      return category.children_data?.map((child) => ({
        ...child,
        parent_category_id: null,
      })) || []
    }

    return [category]
  }
}
