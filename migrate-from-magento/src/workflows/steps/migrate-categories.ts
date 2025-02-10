import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import MagentoModuleService from "../../modules/magento/service";
import { MAGENTO_MODULE } from "../../modules/magento";

export const migrateCategoriesStep = createStep(
  {
    name: "migrate-categories",
    async: true,
  },
  async ({}, { container }) => {
    const magentoModuleService: MagentoModuleService = container.resolve(MAGENTO_MODULE)
    const productModuleService = container.resolve("product")
    const magentoCategories = await magentoModuleService.getCategories()

    const categoriesParentsMap = new Map<string, string[]>()

    const categoriesToCreate = magentoCategories.flatMap((category) => {
      const parentCategoryId = category.parent_id
      if (parentCategoryId) {
        categoriesParentsMap.set(parentCategoryId, [...(categoriesParentsMap.get(parentCategoryId) || []), category.id])
      }

      return {
        name: category.name,
        is_active: category.is_active,
        rank: category.position,
        metadata: {
          external_id: category.id,
        }
      }
    })

    const createdCategories = await productModuleService.createProductCategories(categoriesToCreate)

    const categoriesToUpdate: {
      id: string
      parent_category_id: string
    }[] = []
    
    Array.from(categoriesParentsMap.entries()).map(([parentId, childrenIds]) => {
      const parentCategory = createdCategories.find((category) => category.id === parentId)
      if (!parentCategory) {
        return null
      }

      categoriesToUpdate.push(...childrenIds.map((childId) => ({
        id: childId,
        parent_category_id: parentCategory.id,
      })))
    })

    await productModuleService.upsertProductCategories(categoriesToUpdate)

    console.log(`Created ${createdCategories.length} categories`)

    return new StepResponse(createdCategories, createdCategories)
  },
  async (createdCategories, { container }) => {
    if (!createdCategories?.length) {
      return
    }

    const productModuleService = container.resolve("product")
    
    await productModuleService.deleteProductCategories(createdCategories.map((category) => category.id))
  }
)

