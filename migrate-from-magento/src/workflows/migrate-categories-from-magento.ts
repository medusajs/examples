import { createWorkflow, transform } from "@medusajs/framework/workflows-sdk"
import { getMagentoCategoriesStep } from "./steps/get-magento-categories"
import { createProductCategoriesWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { CreateProductCategoryDTO, ProductCategoryDTO, UpsertProductCategoryDTO } from "@medusajs/framework/types"
import { deepFlatMap } from "@medusajs/framework/utils"
import { MagentoCategory } from "../modules/magento/types"
import { updateProductCategoriesStep } from "./steps/update-product-categories"

function prepareCategoryToUpsert (
  magentCategory: MagentoCategory,
  existingMedusaCategory?: ProductCategoryDTO
): UpsertProductCategoryDTO {
  let categoryData: UpsertProductCategoryDTO = {
    name: magentCategory.name,
    is_active: magentCategory.is_active,
    rank: magentCategory.position,
    metadata: {
      external_id: magentCategory.id,
    }
  }

  if (existingMedusaCategory) {
    categoryData.id = existingMedusaCategory.id
  } else {
    categoryData.handle = `${magentCategory.name.toLowerCase().replace(/ /g, "-")}-${magentCategory.id}`
  }

  return categoryData
}

function getCategoryIds (categories: MagentoCategory[]): number[] {
  const ids: number[] = []
  categories.forEach((category) => {
    ids.push(category.id)
    if (category.children_data?.length) {
      ids.push(...getCategoryIds(category.children_data))
    }
  })
  return ids
}

export const migrateCategoriesFromMagentoId = "migrate-categories-from-magento"

export const migrateCategoriesFromMagento = createWorkflow(
  {
    name: migrateCategoriesFromMagentoId,
    retentionTime: 10000,
    store: true
  },
  () => {
    const magentoCategories = getMagentoCategoriesStep()

    const externalIdFilters = transform({
      magentoCategories
    }, (data) => {
      return getCategoryIds(data.magentoCategories)
    })

    const { data: productCategories } = useQueryGraphStep({
      entity: "product_category",
      fields: ["id", "metadata"],
      filters: {
        metadata: {
          external_id: externalIdFilters
        }
      },
    })

    const {
      categoriesToCreate,
      categoriesToUpdate,
      categoriesParentsMap
    } = transform({
      magentoCategories,
      productCategories,
    }, (data) => {
      const categoriesToCreate = new Map<string, CreateProductCategoryDTO>()
      const categoriesToUpdate = new Map<string, UpsertProductCategoryDTO>()
      const categoriesParentsMap: Record<string, number[]> = {}
      
      deepFlatMap(data.magentoCategories, "children_data", ({ root_: parentCategory, children_data: childCategory }) => {
        const parentCategoryId = childCategory.parent_id
        if (parentCategoryId) {
          categoriesParentsMap[parentCategoryId] = [...(categoriesParentsMap[parentCategoryId] || []), childCategory.id]
        }
        const existingParentCategory = data.productCategories.find(
          (existingCategory) => existingCategory.metadata?.external_id === parentCategory.id
        )
        const existingChildCategory = data.productCategories.find(
          (existingCategory) => existingCategory.metadata?.external_id === childCategory.id
        )
  
        const parentCategoryData = prepareCategoryToUpsert(parentCategory, existingParentCategory)
        const childCategoryData = prepareCategoryToUpsert(childCategory, existingChildCategory)
  
        if (parentCategoryData.id) {
          categoriesToUpdate.set(parentCategory.id, parentCategoryData)
        } else {
          categoriesToCreate.set(parentCategory.id, parentCategoryData as CreateProductCategoryDTO)
        }
  
        if (childCategoryData.id) {
          categoriesToUpdate.set(childCategory.id, childCategoryData)
        } else {
          categoriesToCreate.set(childCategory.id, childCategoryData as CreateProductCategoryDTO)
        }
      })

      return {
        categoriesToCreate: Array.from(categoriesToCreate.values()),
        categoriesToUpdate: Array.from(categoriesToUpdate.values()),
        categoriesParentsMap
      }
    })

    const createdCategories = createProductCategoriesWorkflow.runAsStep({
      input: {
        product_categories: categoriesToCreate,
      }
    })
    
    const updatedCategories = updateProductCategoriesStep({
      product_categories: categoriesToUpdate
    })

    const categoriesToUpdateParent = transform({
      categoriesParentsMap,
      createdCategories,
      updatedCategories
    }, (data) => {
      const categoriesToUpdate: {
        id: string
        parent_category_id: string
      }[] = []

      const upsertedCategories = data.createdCategories.concat(data.updatedCategories)
      
      Object.entries(data.categoriesParentsMap).forEach(([parentId, childrenIds]) => {
        const parentCategory = upsertedCategories.find((category) => category.metadata?.external_id === parseInt(parentId))
        const childCategories = upsertedCategories.filter((category) => 
          // @ts-expect-error something
          category.metadata?.external_id && childrenIds.includes(category.metadata.external_id as string)
        )
        if (!parentCategory || !childCategories.length) {
          return
        }
  
        categoriesToUpdate.push(...childCategories.map((childCategory) => ({
          id: childCategory.id,
          parent_category_id: parentCategory.id,
        })))
      })

      return categoriesToUpdate
    })

    updateProductCategoriesStep({
      product_categories: categoriesToUpdateParent
    }).config({ name: "update-parent-categories-parent" })
  }
)