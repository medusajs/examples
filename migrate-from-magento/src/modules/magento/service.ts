import { Logger } from "@medusajs/framework/types"
import { MedusaError, promiseAll } from "@medusajs/framework/utils"
import { MagentoAttribute, MagentoCategory, MagentoPaginatedResponse, MagentoPagination, MagentoProduct } from "./types"

type Options = {
  baseUrl: string
  storeCode?: string
  username: string
  password: string
  migrationOptions?: {
    migrateDefaultCategory?: boolean
    imageBaseUrl?: string
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
    this.options = {
      ...options,
      storeCode: options.storeCode || "default",
    }
  }

  async authenticate() {
    const response = await fetch(`${this.options.baseUrl}/rest/${this.options.storeCode}/V1/integration/admin/token`, {
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
      token: token.replaceAll('"', ""),
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

    const category: MagentoCategory = await fetch(`${this.options.baseUrl}/rest/${this.options.storeCode}/V1/categories`, {
      headers: {
        "Authorization": `Bearer ${this.accessToken.token}`,
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

  async getProducts(options?: {
    currentPage?: number
    pageSize?: number
    ids?: number[]
  }): Promise<{
    products: MagentoProduct[]
    attributes: MagentoAttribute[]
    pagination: MagentoPagination
  }> {
    const { currentPage, pageSize, ids } = options || { currentPage: 1, pageSize: 100 }
    const getAccessToken = !this.accessToken || await this.isAccessTokenExpired()
    if (getAccessToken) {
      await this.authenticate()
    }

    const searchQuery = new URLSearchParams()
    searchQuery.append("searchCriteria[currentPage]", currentPage?.toString() || "1")
    searchQuery.append("searchCriteria[pageSize]", pageSize?.toString() || "100")

    if (ids?.length) {
      searchQuery.append("searchCriteria[filter_groups][0][filters][0][field]", "entity_id")
      searchQuery.append("searchCriteria[filter_groups][0][filters][0][value]", ids.join(","))
      searchQuery.append("searchCriteria[filter_groups][0][filters][0][condition_type]", "in")
    }

    // retrieve only single and configurable produts
    searchQuery.append("searchCriteria[filter_groups][1][filters][0][field]", "type_id")
    searchQuery.append("searchCriteria[filter_groups][1][filters][0][value]", "configurable")
    searchQuery.append("searchCriteria[filter_groups][1][filters][0][condition_type]", "in")

    const { items: products, ...pagination }: MagentoPaginatedResponse<MagentoProduct> = await fetch(
      `${this.options.baseUrl}/rest/${this.options.storeCode}/V1/products?${searchQuery}`, 
      {
        headers: {
          "Authorization": `Bearer ${this.accessToken.token}`,
        },
      }
    ).then(res => res.json())
    .catch(err => {
      console.log(err)
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to get products from Magento: ${err.message}`)
    })

    const attributeIds: string[] = []

    await promiseAll(
      products.map(async (product) => {
        // retrieve its children
        product.children = await fetch(
          `${this.options.baseUrl}/rest/${this.options.storeCode}/V1/configurable-products/${product.sku}/children`,
          {
            headers: {
              "Authorization": `Bearer ${this.accessToken.token}`,
            }
          }
        ).then(res => res.json())
        .catch(err => {
          throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to get product children from Magento: ${err.message}`)
        })

        product.media_gallery_entries = product.media_gallery_entries.map((entry) => ({
          ...entry,
          file: `${this.options.migrationOptions?.imageBaseUrl}${entry.file}`
        }))

        attributeIds.push(...(product.extension_attributes.configurable_product_options?.map((option) => option.attribute_id) || []))
      })
    )

    const attributes = await this.getAttributes({ ids: attributeIds })
    
    return { products, attributes, pagination }
  }

  async getAttributes ({
    ids
  }: {
    ids: string[]
  }): Promise<MagentoAttribute[]> {
    const getAccessToken = !this.accessToken || await this.isAccessTokenExpired()
    if (getAccessToken) {
      await this.authenticate()
    }

    const searchQuery = new URLSearchParams()
    searchQuery.append("searchCriteria[filter_groups][0][filters][0][field]", "attribute_id")
    searchQuery.append("searchCriteria[filter_groups][0][filters][0][value]", ids.join(","))
    searchQuery.append("searchCriteria[filter_groups][0][filters][0][condition_type]", "in")

    const { items: attributes }: MagentoPaginatedResponse<MagentoAttribute> = await fetch(
      `${this.options.baseUrl}/rest/${this.options.storeCode}/V1/products/attributes?${searchQuery}`, 
      {
        headers: {
          "Authorization": `Bearer ${this.accessToken.token}`,
        },
      }
    ).then(res => res.json())
    .catch(err => {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to get attributes from Magento: ${err.message}`)
    })

    return attributes
  }
}
