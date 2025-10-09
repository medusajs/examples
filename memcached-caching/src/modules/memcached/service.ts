import { ICachingProviderService } from "@medusajs/framework/types"
import * as memjs from "memjs"
import { deflate, inflate } from "zlib"
import { promisify } from "util"
import { ModuleOptions } from "./loaders/connection"

const deflateAsync = promisify(deflate)
const inflateAsync = promisify(inflate)

type InjectedDependencies = {
  memcachedClient: memjs.Client
}

class MemcachedCachingProviderService implements ICachingProviderService {
  static identifier = "memcached-cache"

  protected client: memjs.Client
  protected options_: ModuleOptions
  protected readonly CACHE_PREFIX: string
  protected readonly TAG_PREFIX: string
  protected readonly OPTIONS_PREFIX: string
  protected readonly KEY_TAGS_PREFIX: string
  protected readonly TAG_KEYS_PREFIX: string
  protected readonly compressionEnabled: boolean
  protected readonly compressionThreshold: number
  protected readonly compressionLevel: number
  protected readonly defaultTtl: number

  constructor(
    { memcachedClient }: InjectedDependencies,
    options: ModuleOptions
  ) {
    this.client = memcachedClient
    this.options_ = options
    
    // Set all prefixes with the main prefix
    const mainPrefix = options.cachePrefix || "medusa"
    this.CACHE_PREFIX = `${mainPrefix}:`
    this.TAG_PREFIX = `${mainPrefix}:tag:`
    this.OPTIONS_PREFIX = `${mainPrefix}:opt:`
    this.KEY_TAGS_PREFIX = `${mainPrefix}:key_tags:`
    this.TAG_KEYS_PREFIX = `${mainPrefix}:tag_keys:`
    
    // Set compression options
    this.compressionEnabled = options.compression?.enabled ?? true
    this.compressionThreshold = options.compression?.threshold ?? 2048 // 2KB default
    this.compressionLevel = options.compression?.level ?? 6 // Balanced compression
    
    // Set default TTL
    this.defaultTtl = options.defaultTtl ?? 3600 // 1 hour default
  }

  /**
   * COMPRESSION METHODS
   */

  /**
   * Compress data if compression is enabled and data size exceeds threshold
   */
  private async compressData(data: string): Promise<{ data: string; compressed: boolean }> {
    if (!this.compressionEnabled || data.length < this.compressionThreshold) {
      return { data, compressed: false }
    }

    const buffer = Buffer.from(data, 'utf8')
    const compressed = await deflateAsync(buffer)
    const compressedData = compressed.toString('base64')
    
    // Only use compression if it actually reduces size
    if (compressedData.length < data.length) {
      return { data: compressedData, compressed: true }
    }
    
    return { data, compressed: false }
  }

  /**
   * Decompress data if it was compressed
   */
  private async decompressData(data: string, compressed: boolean): Promise<string> {
    if (!compressed) {
      return data
    }

    const buffer = Buffer.from(data, 'base64')
    const decompressed = await inflateAsync(buffer)
    return decompressed.toString('utf8')
  }

  /**
   * CLEAR METHODS
   */

  async clear({
    key,
    tags,
    options,
  }: {
    key?: string
    tags?: string[]
    options?: { autoInvalidate?: boolean }
  }): Promise<void> {
    if (key) {
      await this.clearByKey(key)
    }

    if (tags?.length) {
      if (!options) {
        // Clear all items with the specified tags
        await this.clearByTags(tags)
      } else if (options.autoInvalidate) {
        // Clear only items with autoInvalidate option set to true
        await this.clearByTagsWithAutoInvalidate(tags)
      }
    }
  }

  /**
   * Optimized key clearing with batch operations
   */
  private async clearByKey(key: string): Promise<void> {
    // Get the key's tags before deleting to clean up tag key lists
    const keyTagsKey = `${this.KEY_TAGS_PREFIX}${key}`
    const keyTagsResult = await this.client.get(keyTagsKey)
    
    const operations: Promise<any>[] = [
      this.client.delete(this.CACHE_PREFIX + key),
      this.client.delete(this.OPTIONS_PREFIX + key),
      this.client.delete(keyTagsKey)
    ]

    // If the key has tags, remove it from tag key lists
    if (keyTagsResult.value) {
      const storedTags = JSON.parse(keyTagsResult.value.toString())
      const tagNames = Object.keys(storedTags)
      
      // Batch tag cleanup operations
      const tagCleanupOperations = tagNames.map(async tag => {
        await this.removeKeysFromTag(tag, [key])
      })
      operations.push(...tagCleanupOperations)
    }

    await Promise.all(operations)
  }

  /**
   * Remove keys from the list of keys for a specific tag
   */
  private async removeKeysFromTag(tag: string, keysToRemove: string[]): Promise<void> {
    const tagKeysKey = `${this.TAG_KEYS_PREFIX}${tag}`
    const tagKeysResult = await this.client.get(tagKeysKey)
    
    if (!tagKeysResult.value) {
      return // No keys to remove
    }
    
    let keys: string[] = JSON.parse(tagKeysResult.value.toString()) as string[]
    
    // Remove the specified keys
    keys = keys.filter(key => !keysToRemove.includes(key))
    
    if (keys.length === 0) {
      // If no keys left, delete the tag keys entry
      await this.client.delete(tagKeysKey)
    } else {
      // Update the tag keys list
      await this.client.set(tagKeysKey, JSON.stringify(keys))
    }
  }

  /**
   * Optimized tag clearing using batch operations
   */
  private async clearByTags(tags: string[]): Promise<void> {
    const operations = tags.map(async tag => {
      const tagKey = this.TAG_PREFIX + tag
      const result = await this.client.increment(tagKey, 1)
      if (result === null) {
        // Key doesn't exist, create it with current timestamp
        const timestamp = Math.floor(Date.now() / 1000)
        await this.client.add(tagKey, timestamp.toString())
      }
    })

    await Promise.all(operations)
  }

  /**
   * Clear cache entries by tags, but only those with autoInvalidate option set to true
   * This retrieves the list of keys for each tag and checks their options
   */
  private async clearByTagsWithAutoInvalidate(tags: string[]): Promise<void> {
    for (const tag of tags) {
      // Get the list of keys associated with this tag
      const tagKeysKey = `${this.TAG_KEYS_PREFIX}${tag}`
      const tagKeysResult = await this.client.get(tagKeysKey)
      
      if (!tagKeysResult.value) {
        continue
      }
      
      const keys = JSON.parse(tagKeysResult.value.toString()) as string[]
      
      // Check each key's options and delete if autoInvalidate is true
      const keysToRemove: string[] = []
      for (const key of keys) {
        const optionsKey = `${this.OPTIONS_PREFIX}${key}`
        const optionsResult = await this.client.get(optionsKey)
        
        if (optionsResult.value) {
          const options = JSON.parse(optionsResult.value.toString())
          if (options.autoInvalidate) {
            // Delete the key and its associated data
            await this.client.delete(this.CACHE_PREFIX + key)
            await this.client.delete(optionsKey)
            await this.client.delete(`${this.KEY_TAGS_PREFIX}${key}`)
            keysToRemove.push(key)
          }
        }
      }
      
      // Remove deleted keys from the tag's key list
      if (keysToRemove.length > 0) {
        await this.removeKeysFromTag(tag, keysToRemove)
      }
    }
  }

  /**
   * GET METHODS
   */

  async get({
    key,
    tags,
  }: {
    key?: string
    tags?: string[]
  }): Promise<any> {
    if (key) {
      const prefixedKey = this.CACHE_PREFIX + key
      
      // Get the stored tags for this key and validate them
      const keyTagsKey = `${this.KEY_TAGS_PREFIX}${key}`
      const keyTagsResult = await this.client.get(keyTagsKey)
      
      if (keyTagsResult.value) {
        const storedTags = JSON.parse(keyTagsResult.value.toString())
        const tagNames = Object.keys(storedTags)
        
        const isValid = await this.validateKeyByTags(key, tagNames)
        if (!isValid) {
          return null
        }
      }

      const result = await this.client.get(prefixedKey)
      if (result.value) {
        const dataString = result.value.toString()
        
        // Check if data is compressed (look for compression flag in options)
        const optionsKey = this.OPTIONS_PREFIX + key
        const optionsResult = await this.client.get(optionsKey)
        let compressed = false
        
        if (optionsResult.value) {
          const options = JSON.parse(optionsResult.value.toString())
          compressed = options.compressed || false
        }
        
        // Decompress if needed
        const decompressedData = await this.decompressData(dataString, compressed)
        return JSON.parse(decompressedData)
      }
      return null
    }

    if (tags && tags.length > 0) {
      // Retrieve data by tags - get all keys associated with the tags
      return await this.getByTags(tags)
    }

    return null
  }

  /**
   * Optimized tag validation using batch operations
   */
  private async validateKeyByTags(key: string, tags: string[]): Promise<boolean> {
    if (!tags || tags.length === 0) {
      return true // No tags to validate
    }

    // Get the stored tag namespaces for this key
    const keyTagsKey = `${this.KEY_TAGS_PREFIX}${key}`
    const keyTagsResult = await this.client.get(keyTagsKey)
    
    if (!keyTagsResult.value) {
      return true // No stored tags, assume valid
    }

    const storedTags = JSON.parse(keyTagsResult.value.toString())
    
    // Batch all namespace checks for better performance
    const tagKeys = Object.keys(storedTags).map(tag => this.TAG_PREFIX + tag)
    const tagResults = await Promise.all(
      tagKeys.map(tagKey => this.client.get(tagKey))
    )

    // Check if any tag namespace is missing or changed
    for (let i = 0; i < tagResults.length; i++) {
      const tag = Object.keys(storedTags)[i]
      const tagResult = tagResults[i]
      
      if (tagResult.value) {
        const currrentTag = tagResult.value.toString()
        // If the namespace has changed since the key was stored, it's invalid
        if (currrentTag !== storedTags[tag]) {
          return false
        }
      } else {
        // Namespace doesn't exist - this means it was reclaimed after being incremented
        // This indicates the tag was cleared, so the key should be considered invalid
        return false
      }
    }
    
    return true
  }

  /**
   * Retrieve data by tags - returns all cached data associated with the specified tags
   */
  private async getByTags(tags: string[]): Promise<any[] | null> {
    if (!tags || tags.length === 0) {
      return null
    }

    // Get all keys associated with each tag
    const tagKeysOperations = tags.map(tag => {
      const tagKeysKey = `${this.TAG_KEYS_PREFIX}${tag}`
      return this.client.get(tagKeysKey)
    })

    const tagKeysResults = await Promise.all(tagKeysOperations)
    
    // Collect all unique keys from all tags
    const allKeys = new Set<string>()
    for (const result of tagKeysResults) {
      if (result.value) {
        const keys = JSON.parse(result.value.toString()) as string[]
        keys.forEach(key => allKeys.add(key))
      }
    }

    if (allKeys.size === 0) {
      return null
    }

     // Get all cached data for the collected keys
     const dataOperations = Array.from(allKeys).map(async key => {
       const prefixedKey = this.CACHE_PREFIX + key
       const result = await this.client.get(prefixedKey)
       
       if (!result.value) {
         return { key, data: null }
       }
       
       const dataString = result.value.toString()
       
       // Check if data is compressed
       const optionsKey = this.OPTIONS_PREFIX + key
       const optionsResult = await this.client.get(optionsKey)
       let compressed = false
       
       if (optionsResult.value) {
         const options = JSON.parse(optionsResult.value.toString())
         compressed = options.compressed || false
       }
       
       // Decompress if needed
       const decompressedData = await this.decompressData(dataString, compressed)
       return { key, data: JSON.parse(decompressedData) }
     })

    const dataResults = await Promise.all(dataOperations)
    
    // Filter out null data and validate tags for each key
    const validData: any[] = []
    for (const { key, data } of dataResults) {
      if (data !== null) {
        // Validate that this key is still valid for the requested tags
        const isValid = await this.validateKeyByTags(key, tags)
        if (isValid) {
          validData.push(data)
        }
      }
    }

    return Object.keys(validData).length > 0 ? validData : null
  }

  /**
   * SET METHODS
   */

  async set({
    key,
    data,
    ttl,
    tags,
    options,
  }: {
    key: string
    data: any
    ttl?: number
    tags?: string[]
    options?: { autoInvalidate?: boolean }
  }): Promise<void> {
    const prefixedKey = this.CACHE_PREFIX + key
    const serializedData = JSON.stringify(data)
    const setOptions: memjs.InsertOptions = {}
    
    // Use provided TTL or default TTL
    setOptions.expires = ttl ?? this.defaultTtl

    // Compress data if enabled
    const { data: finalData, compressed } = await this.compressData(serializedData)

    // Batch operations for better performance
    const operations: Promise<any>[] = [
      this.client.set(prefixedKey, finalData, setOptions)
    ]

    // Always store options (including compression flag) to allow checking them later
    const optionsKey = this.OPTIONS_PREFIX + key
    const optionsData = { ...options, compressed }
    operations.push(this.client.set(optionsKey, JSON.stringify(optionsData), setOptions))

    // Handle tags using namespace simulation with batching
    if (tags && tags.length > 0) {
      operations.push(this.setKeyTags(key, tags, setOptions))
    }

    await Promise.all(operations)
  }

  /**
   * Optimized tag setting with batch operations
   */
  private async setKeyTags(key: string, tags: string[], setOptions: memjs.InsertOptions): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000)
    const tagNamespaces: Record<string, string> = {}
    const operations: Promise<any>[] = []

    // Batch all namespace operations
    for (const tag of tags) {
      const tagKey = this.TAG_PREFIX + tag
      const tagKeysKey = `${this.TAG_KEYS_PREFIX}${tag}`
      
      // Get namespace version
      operations.push(
        (async () => {
          const result = await this.client.get(tagKey)
          if (!result.value) {
            tagNamespaces[tag] = timestamp.toString()
            await this.client.add(tagKey, timestamp.toString())
          } else {
            tagNamespaces[tag] = result.value.toString()
          }
        })()
      )

      // Add key to tag's key list
      operations.push(
        (async () => {
          const result = await this.client.get(tagKeysKey)
          let keys: string[] = []
          if (result.value) {
            keys = JSON.parse(result.value.toString()) as string[]
          }
          if (!keys.includes(key)) {
            keys.push(key)
            await this.client.set(tagKeysKey, JSON.stringify(keys), setOptions)
          }
        })()
      )
    }

    await Promise.all(operations)
    
    // Store the tag namespaces for this key
    const keyTagsKey = `${this.KEY_TAGS_PREFIX}${key}`
    const serializedTags = JSON.stringify(tagNamespaces)
    await this.client.set(keyTagsKey, serializedTags, setOptions)
  }

}

export default MemcachedCachingProviderService
