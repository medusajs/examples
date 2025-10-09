import { LoaderOptions } from "@medusajs/framework/types"
import * as memjs from "memjs"

export type ModuleOptions = {
  serverUrls?: string[]
  username?: string
  password?: string
  options?: memjs.ClientOptions
  cachePrefix?: string
  defaultTtl?: number // Default TTL in seconds
  compression?: {
    enabled?: boolean
    threshold?: number // Minimum size in bytes to compress
    level?: number // Compression level (1-9)
  }
}

export default async function connection({
  container,
  options,
}: LoaderOptions<ModuleOptions>) {
  const logger = container.resolve("logger")
  const { 
    serverUrls = ["127.0.0.1:11211"], 
    username, 
    password, 
    options: clientOptions
  } = options || {}

  try {
    logger.info("Connecting to Memcached...")

    // Create Memcached client
    const client = memjs.Client.create(serverUrls.join(','), {
      username,
      password,
      ...clientOptions,
    })

    // Test the connection
    await new Promise<void>((resolve, reject) => {
      client.stats((err, stats) => {
        if (err) {
          logger.error("Failed to connect to Memcached:", err)
          reject(err)
        } else {
          logger.info("Successfully connected to Memcached")
          resolve()
        }
      })
    })

    // Register the client in the container
    container.register({
      memcachedClient: {
        resolve: () => client,
      },
    })

  } catch (error) {
    logger.error("Failed to initialize Memcached connection:", error)
    throw error
  }
}
