import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export const prepareStrapiUpdateDataStep = createStep(
  "prepare-strapi-update-data",
  async ({ entry }: { entry: any }) => {
    let data: Record<string, unknown> = {}
    const model = entry.model

    switch (model) {
      case "product":
        data = {
          id: entry.entry.medusaId,
          title: entry.entry.title,
          subtitle: entry.entry.subtitle,
          description: entry.entry.description,
          handle: entry.entry.handle,
        }
        break
      case "product-variant":
        data = {
          id: entry.entry.medusaId,
          title: entry.entry.title,
          sku: entry.entry.sku,
        }
        break
      case "product-option":
        data = {
          selector: {
            id: entry.entry.medusaId,
          },
          update: {
            title: entry.entry.title,
          },
        }
        break
      case "product-option-value":
        data = {
          optionValueId: entry.entry.medusaId,
          value: entry.entry.value,
        }
        break
    }

    return new StepResponse({ data, model })
  }
)

