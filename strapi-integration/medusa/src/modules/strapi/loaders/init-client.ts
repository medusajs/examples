import { LoaderOptions } from "@medusajs/framework/types"
import { asValue } from "@medusajs/framework/awilix"
import { MedusaError } from "@medusajs/framework/utils"
import { strapi } from "@strapi/client"

export type ModuleOptions = {
  apiUrl: string
  apiToken: string
  defaultLocale?: string
}

export default async function initStrapiClientLoader({
  container,
  options,
}: LoaderOptions<ModuleOptions>) {
  if (!options?.apiUrl || !options?.apiToken) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Strapi API URL and token are required"
    )
  }

  const logger = container.resolve("logger")

  try {
    // Create Strapi client instance
    const strapiClient = strapi({
      baseURL: options.apiUrl,
      auth: options.apiToken,
    })

    // Register the client in the container
    container.register({
      strapiClient: asValue(strapiClient),
    })

    logger.info("Strapi client initialized successfully")
  } catch (error) {
    logger.error(`Failed to initialize Strapi client: ${error}`)
    throw error
  }
}