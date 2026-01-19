import type { StrapiClient } from "@strapi/client"
import { MedusaError } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { ModuleOptions } from "./loaders/init-client"

type InjectedDependencies = {
  logger: Logger
  strapiClient: StrapiClient
}

export enum Collection {
  PRODUCTS = "products",
  PRODUCT_VARIANTS = "product-variants",
  PRODUCT_OPTIONS = "product-options",
  PRODUCT_OPTION_VALUES = "product-option-values",
}

export default class StrapiModuleService {
  protected readonly options_: ModuleOptions
  protected readonly logger_: Logger
  protected readonly client_: StrapiClient

  constructor(
    { logger, strapiClient }: InjectedDependencies, 
    options: ModuleOptions
  ) {
    this.options_ = options
    this.logger_ = logger
    this.client_ = strapiClient
  }

  formatStrapiError(error: any, context: string): string {
    // Handle Strapi client HTTP response errors
    if (error?.response) {
      const response = error.response
      const parts = [context]
      
      if (response.status) {
        parts.push(`HTTP ${response.status}`)
      }
      
      if (response.statusText) {
        parts.push(response.statusText)
      }
      
      // Add request URL if available
      if (response.url) {
        parts.push(`URL: ${response.url}`)
      }
      
      // Add request method if available
      if (error.request?.method) {
        parts.push(`Method: ${error.request.method}`)
      }
      
      return parts.join(' - ')
    }
    
    // If error has a response with Strapi error structure
    if (error?.error) {
      const strapiError = error.error
      const parts = [context]
      
      if (strapiError.status) {
        parts.push(`Status ${strapiError.status}`)
      }
      
      if (strapiError.name) {
        parts.push(`[${strapiError.name}]`)
      }
      
      if (strapiError.message) {
        parts.push(strapiError.message)
      }
      
      if (strapiError.details && Object.keys(strapiError.details).length > 0) {
        parts.push(`Details: ${JSON.stringify(strapiError.details)}`)
      }
      
      return parts.join(' - ')
    }
    
    // Fallback for non-Strapi errors
    return `${context}: ${error.message || error}`
  }

  async uploadImages(imageUrls: string[]): Promise<number[]> {
    const uploadedIds: number[] = []

    for (const imageUrl of imageUrls) {
      try {
        // Fetch the image from the URL
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
          this.logger_.warn(`Failed to fetch image: ${imageUrl}`)
          continue
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        
        // Extract filename from URL or generate one
        const urlParts = imageUrl.split("/")
        const filename = urlParts[urlParts.length - 1] || `image-${Date.now()}.jpg`

        // Create a Blob from the buffer
        const blob = new Blob([imageBuffer], {
          type: imageResponse.headers.get("content-type") || "image/jpeg",
        })

        // Upload to Strapi using the files API
        const result = await this.client_.files.upload(blob, {
          fileInfo: {
            name: filename,
          },
        })
        
        if (result && result[0] && result[0].id) {
          uploadedIds.push(result[0].id)
        }
      } catch (error) {
        this.logger_.error(this.formatStrapiError(error, `Failed to upload image ${imageUrl}`))
      }
    }

    return uploadedIds
  }

  async deleteImage(imageId: number): Promise<void> {
    try {
      await this.client_.files.delete(imageId)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        this.formatStrapiError(error, `Failed to delete image ${imageId} from Strapi`)
      )
    }
  }

  async create(collection: Collection, data: Record<string, unknown>) {
    try {
      return await this.client_.collection(collection).create(data)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        this.formatStrapiError(error, `Failed to create ${collection} in Strapi`)
      )
    }
  }

  async update(collection: Collection, id: string, data: Record<string, unknown>) {
    try {
      return await this.client_.collection(collection).update(id, data)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        this.formatStrapiError(error, `Failed to update ${collection} in Strapi`)
      )
    }
  }

  async delete(collection: Collection, id: string) {
    try {
      return await this.client_.collection(collection).delete(id)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        this.formatStrapiError(error, `Failed to delete ${collection} in Strapi`)
      )
    }
  }

  async findByMedusaId(
    collection: Collection, 
    medusaId: string | string[], 
    populate?: string[]
  ) {
    try {
      const result = await this.client_.collection(collection).find({
        filters: {
          medusaId: {
            $in: Array.isArray(medusaId) ? medusaId : [medusaId],
          },
        },
        populate,
      })

      return result.data
    }
    catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        this.formatStrapiError(error, `Failed to find ${collection} in Strapi`)
      )
    }
  }

  // List method for virtual read-only link
  async list(filter: { product_id: string | string[] }) {
    const ids = Array.isArray(filter.product_id) 
      ? filter.product_id 
      : [filter.product_id]
    
    const results: any[] = []
    
    for (const productId of ids) {
      try {
        // Fetch product with all relations populated
        const result = await this.client_.collection("products").find({
          filters: {
            medusaId: {
              $eq: productId,
            },
          },
          populate: {
            variants: {
              populate: ["option_values"],
            },
            options: {
              populate: ["values"],
            },
          },
        })
        
        if (result.data && result.data.length > 0) {
          const product = result.data[0]
          results.push({
            ...product,
            id: `${product.id}`,
            product_id: productId,
            // Include populated relations
            variants: (product.variants || []).map((variant) => ({
              ...variant,
              id: `${variant.id}`,
              option_values: (variant.option_values || []).map((option_value) => ({
                ...option_value,
                id: `${option_value.id}`,
              })),
            })),
            options: (product.options || []).map((option) => ({
              ...option,
              id: `${option.id}`,
              values: (option.values || []).map((value) => ({
                ...value,
                id: `${value.id}`,
              })),
            })),
          })
        }
      } catch (error) {
        this.logger_.warn(this.formatStrapiError(error, `Failed to fetch product ${productId} from Strapi`))
      }
    }
    
    return results
  }
}

