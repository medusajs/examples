import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { migrateCategoriesFromMagento, migrateProductsFromMagentoWorkflow } from "../workflows"
import { promiseAll } from "@medusajs/framework/utils"

type Payload = {
  type: ("product" | "category")[]
}

export default async function productCreateHandler({
  event: { data },
  container,
}: SubscriberArgs<Payload>) {
  const logger = container.resolve("logger")
  await promiseAll(
    data.type.map(async (type) => {
      switch (type) {
        case "product":
          logger.info("Migrating products from Magento...")
  
          let currentPage = 0
          const pageSize = 100
          let totalCount = 0
  
          do {
            currentPage++
  
            const { result: pagination } = await migrateProductsFromMagentoWorkflow(container).run({
              input: {
                currentPage,
                pageSize
              }
            })

            totalCount = pagination.total_count
          } while (currentPage * pageSize < totalCount)
  
          break
        case "category":
          logger.info("Migrating categories from Magento...")
          await migrateCategoriesFromMagento(container).run()
          break
        default:
          console.log(`Unknown type: ${type}`)
      }
    })
  )

  console.log("Finished migration from Magento")
}

export const config: SubscriberConfig = {
  event: "migrate.magento",
}
